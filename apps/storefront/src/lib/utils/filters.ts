import type { AvailabilityFilter, ProductFiltersResponse } from "@spree/sdk";
import type { ActiveFilters, TokiFilterKey } from "@/types/filters";

const EMPTY_AVAILABILITY_FILTER: AvailabilityFilter = {
  id: "availability",
  type: "availability",
  options: [
    { id: "in_stock", count: 0 },
    { id: "out_of_stock", count: 0 },
  ],
};

export function getAvailabilityFilter(
  filtersData: ProductFiltersResponse | null,
): AvailabilityFilter {
  return (
    filtersData?.filters.find(
      (filter): filter is AvailabilityFilter => filter.type === "availability",
    ) ?? EMPTY_AVAILABILITY_FILTER
  );
}

export function filtersEqual(a: ActiveFilters, b: ActiveFilters): boolean {
  if (a.priceMin !== b.priceMin || a.priceMax !== b.priceMax) return false;
  if (a.availability !== b.availability) return false;
  if (a.sortBy !== b.sortBy) return false;
  if (a.players !== b.players) return false;
  if (a.maxDuration !== b.maxDuration) return false;
  if (a.playerAge !== b.playerAge) return false;
  if (a.complexity !== b.complexity) return false;
  if (a.gameLanguage !== b.gameLanguage) return false;
  if (a.optionValues.length !== b.optionValues.length) return false;
  const aVals = [...a.optionValues].sort();
  const bVals = [...b.optionValues].sort();
  for (let i = 0; i < aVals.length; i++) {
    if (aVals[i] !== bVals[i]) return false;
  }
  return true;
}

export function getActiveFilterCount(filters: ActiveFilters): number {
  return (
    filters.optionValues.length +
    (filters.priceMin !== undefined || filters.priceMax !== undefined ? 1 : 0) +
    (filters.availability ? 1 : 0) +
    getTokiFilterCount(filters)
  );
}

export function getTokiFilterCount(filters: ActiveFilters): number {
  return [
    filters.players,
    filters.maxDuration,
    filters.playerAge,
    filters.complexity,
    filters.gameLanguage,
  ].filter((value) => value !== undefined).length;
}

export function clearActiveFilters(filters: ActiveFilters): ActiveFilters {
  return { optionValues: [], sortBy: filters.sortBy };
}

export function removeTokiFilter(
  filters: ActiveFilters,
  key: TokiFilterKey,
): ActiveFilters {
  const next = { ...filters };
  delete next[key];
  return next;
}

/** Maps sort API keys to translation message keys in the "products" namespace. */
const SORT_KEY_TO_MESSAGE: Record<string, string> = {
  manual: "manual",
  best_selling: "bestSelling",
  price: "priceLowHigh",
  "-price": "priceHighLow",
  "-available_on": "newest",
  available_on: "oldest",
  name: "nameAZ",
  "-name": "nameZA",
};

export function normalizeSortKey(key: string): string {
  if (key in SORT_KEY_TO_MESSAGE) return key;
  const match = key.match(/^(\w+)\s+(asc|desc)$/);
  if (!match) return key;
  const [, field, direction] = match;
  const needsNegation =
    (field === "available_on" && direction === "desc") ||
    (field !== "available_on" && direction === "desc");
  return needsNegation ? `-${field}` : field;
}

/**
 * Get a translated sort label.
 * Pass a `t` function from `useTranslations("products")`.
 * Falls back to the raw key if no translator is provided.
 */
const SORT_FALLBACK: Record<string, string> = {
  manual: "Manual",
  best_selling: "Best Selling",
  price: "Price (low-high)",
  "-price": "Price (high-low)",
  "-available_on": "Newest",
  available_on: "Oldest",
  name: "Name (A-Z)",
  "-name": "Name (Z-A)",
};

export function getSortLabel(key: string, t?: (key: string) => string): string {
  const normalized = normalizeSortKey(key);
  const messageKey = SORT_KEY_TO_MESSAGE[normalized];
  if (messageKey && t) return t(messageKey);
  return SORT_FALLBACK[normalized] || key;
}

export function getSortOptionLabel(
  option: { id: string; label?: string | null },
  t?: (key: string) => string,
): string {
  if (option.label) return option.label;
  return getSortLabel(option.id, t);
}

/** Maps availability API values to translation message keys in the "products" namespace. */
const AVAILABILITY_KEY_TO_MESSAGE: Record<string, string> = {
  in_stock: "inStock",
  out_of_stock: "outOfStock",
};

/**
 * Get a translated availability label.
 * Pass a `t` function from `useTranslations("products")`.
 */
const AVAILABILITY_FALLBACK: Record<string, string> = {
  in_stock: "In Stock",
  out_of_stock: "Out of Stock",
};

export function getAvailabilityLabel(
  id: string,
  t?: (key: string) => string,
): string {
  const messageKey = AVAILABILITY_KEY_TO_MESSAGE[id];
  if (messageKey && t) return t(messageKey);
  return AVAILABILITY_FALLBACK[id] || id;
}
