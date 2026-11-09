"use client";

import type { OptionFilter, ProductFiltersResponse } from "@spree/sdk";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { getAvailabilityLabel } from "@/lib/utils/filters";
import {
  findMatchingBucket,
  type PriceBucket,
} from "@/lib/utils/price-buckets";
import type { ActiveFilters, TokiFilterKey } from "@/types/filters";

interface FilterChipsProps {
  activeFilters: ActiveFilters;
  filtersData: ProductFiltersResponse | null;
  priceBuckets: PriceBucket[];
  onRemoveOptionValue: (optionValueId: string) => void;
  onRemovePrice: () => void;
  onRemoveAvailability: () => void;
  onRemoveTokiFilter: (key: TokiFilterKey) => void;
  onClearAll: () => void;
}

export function FilterChips({
  activeFilters,
  filtersData,
  priceBuckets,
  onRemoveOptionValue,
  onRemovePrice,
  onRemoveAvailability,
  onRemoveTokiFilter,
  onClearAll,
}: FilterChipsProps) {
  const t = useTranslations("products");
  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  if (filtersData) {
    for (const optionValueId of activeFilters.optionValues) {
      const optionFilter = filtersData.filters.find(
        (f) =>
          f.type === "option" &&
          (f as OptionFilter).options.some((o) => o.id === optionValueId),
      ) as OptionFilter | undefined;

      if (optionFilter) {
        const option = optionFilter.options.find((o) => o.id === optionValueId);
        if (option) {
          chips.push({
            key: `option-${optionValueId}`,
            label: t("optionFilterChip", {
              filter: optionFilter.label,
              value: option.label,
            }),
            onRemove: () => onRemoveOptionValue(optionValueId),
          });
        }
      }
    }
  }

  if (
    activeFilters.priceMin !== undefined ||
    activeFilters.priceMax !== undefined
  ) {
    const matchingBucket = findMatchingBucket(
      priceBuckets,
      activeFilters.priceMin,
      activeFilters.priceMax,
    );
    chips.push({
      key: "price",
      label: t("priceLabel", {
        value: matchingBucket?.label || t("customPrice"),
      }),
      onRemove: onRemovePrice,
    });
  }

  if (activeFilters.availability) {
    chips.push({
      key: "availability",
      label: getAvailabilityLabel(activeFilters.availability, t),
      onRemove: onRemoveAvailability,
    });
  }

  const tokiValues: {
    key: TokiFilterKey;
    label: string;
    value: string | number | undefined;
  }[] = [
    {
      key: "players",
      label: "Număr de jucători",
      value: activeFilters.players,
    },
    {
      key: "maxDuration",
      label: "Durată maximă",
      value:
        activeFilters.maxDuration !== undefined
          ? `${activeFilters.maxDuration} minute`
          : undefined,
    },
    {
      key: "playerAge",
      label: "Vârsta jucătorului",
      value:
        activeFilters.playerAge !== undefined
          ? `${activeFilters.playerAge} ani`
          : undefined,
    },
    {
      key: "complexity",
      label: "Complexitate",
      value:
        activeFilters.complexity === "usor"
          ? "Ușor"
          : activeFilters.complexity === "mediu"
            ? "Mediu"
            : activeFilters.complexity === "avansat"
              ? "Avansat"
              : undefined,
    },
    {
      key: "gameLanguage",
      label: "Limba jocului",
      value:
        activeFilters.gameLanguage === "romana"
          ? "Română"
          : activeFilters.gameLanguage === "engleza"
            ? "Engleză"
            : undefined,
    },
  ];

  for (const filter of tokiValues) {
    if (filter.value !== undefined) {
      chips.push({
        key: `toki-${filter.key}`,
        label: `${filter.label}: ${filter.value}`,
        onRemove: () => onRemoveTokiFilter(filter.key),
      });
    }
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-sm bg-gray-50 text-primary rounded-lg"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={chip.onRemove}
            className="p-0.5 text-primary hover:text-primary transition-colors"
            aria-label={t("clearFilter", { label: chip.label })}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      ))}
      <Button variant="link" size="sm" onClick={onClearAll}>
        {t("clearAll")}
      </Button>
    </div>
  );
}
