"use client";

import type {
  OptionFilter,
  PriceRangeFilter,
  ProductFiltersResponse,
} from "@spree/sdk";
import { SlidersHorizontal } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { JSX } from "react";
import { memo, useCallback, useMemo, useState } from "react";
import { AvailabilityDropdownContent } from "@/components/products/filters/AvailabilityDropdownContent";
import { FilterBarSkeleton } from "@/components/products/filters/FilterBarSkeleton";
import { FilterChips } from "@/components/products/filters/FilterChips";
import { FilterDropdown } from "@/components/products/filters/FilterDropdown";
import { MobileFilterDrawer } from "@/components/products/filters/MobileFilterDrawer";
import { OptionDropdownContent } from "@/components/products/filters/OptionDropdownContent";
import { PriceDropdownContent } from "@/components/products/filters/PriceDropdownContent";
import { SortDropdownContent } from "@/components/products/filters/SortDropdownContent";
import {
  getTokiFilterValue,
  TOKI_GAME_FILTER_FIELDS,
  updateTokiFilter,
} from "@/components/products/filters/TokiGameFilters";
import {
  clearActiveFilters,
  getActiveFilterCount,
  getAvailabilityFilter,
  removeTokiFilter,
} from "@/lib/utils/filters";
import { generatePriceBuckets } from "@/lib/utils/price-buckets";
import type {
  ActiveFilters,
  AvailabilityStatus,
  TokiFilterKey,
} from "@/types/filters";

interface FilterBarProps {
  filtersData: ProductFiltersResponse | null;
  filtersLoading: boolean;
  currency?: string;
  activeFilters: ActiveFilters;
  totalCount: number;
  onFilterChange: (filters: ActiveFilters) => void;
}

export const FilterBar = memo(function FilterBar({
  filtersData,
  filtersLoading,
  currency,
  activeFilters,
  totalCount,
  onFilterChange,
}: FilterBarProps): JSX.Element | null {
  const t = useTranslations("products");
  const locale = useLocale();
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  const toggleDropdown = useCallback((id: string) => {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  }, []);

  const closeDropdown = useCallback(() => {
    setOpenDropdownId(null);
  }, []);

  const handleOptionValueToggle = useCallback(
    (optionValueId: string) => {
      const newOptionValues = activeFilters.optionValues.includes(optionValueId)
        ? activeFilters.optionValues.filter((id) => id !== optionValueId)
        : [...activeFilters.optionValues, optionValueId];
      onFilterChange({ ...activeFilters, optionValues: newOptionValues });
    },
    [activeFilters, onFilterChange],
  );

  const handlePriceChange = useCallback(
    (min?: number, max?: number) => {
      onFilterChange({ ...activeFilters, priceMin: min, priceMax: max });
    },
    [activeFilters, onFilterChange],
  );

  const handleAvailabilityChange = useCallback(
    (availability?: AvailabilityStatus) => {
      onFilterChange({ ...activeFilters, availability });
    },
    [activeFilters, onFilterChange],
  );

  const handleRemoveTokiFilter = useCallback(
    (key: TokiFilterKey) => {
      onFilterChange(removeTokiFilter(activeFilters, key));
    },
    [activeFilters, onFilterChange],
  );

  const handleSortChange = useCallback(
    (sortBy: string) => {
      onFilterChange({ ...activeFilters, sortBy });
      closeDropdown();
    },
    [activeFilters, onFilterChange, closeDropdown],
  );

  const clearFilters = useCallback(() => {
    onFilterChange(clearActiveFilters(activeFilters));
  }, [onFilterChange, activeFilters]);

  const priceBuckets = useMemo(() => {
    const priceFilter = filtersData?.filters.find(
      (f) => f.type === "price_range",
    ) as PriceRangeFilter | undefined;
    const priceCurrency = priceFilter?.currency ?? currency;
    if (!priceCurrency) return [];
    return generatePriceBuckets(priceCurrency, { t, locale });
  }, [filtersData, currency, t, locale]);

  const optionFilters = useMemo(() => {
    if (!filtersData) return [];
    return filtersData.filters.filter(
      (f) => f.type === "option",
    ) as OptionFilter[];
  }, [filtersData]);

  const badgeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const filter of optionFilters) {
      counts[filter.id] = filter.options.filter((o) =>
        activeFilters.optionValues.includes(o.id),
      ).length;
    }
    return counts;
  }, [optionFilters, activeFilters.optionValues]);

  const priceBadge =
    activeFilters.priceMin !== undefined || activeFilters.priceMax !== undefined
      ? 1
      : 0;

  const availabilityBadge = activeFilters.availability ? 1 : 0;

  const totalActiveFilters = getActiveFilterCount(activeFilters);

  const hasActiveFilters = totalActiveFilters > 0;

  const activeSortBy = activeFilters.sortBy || filtersData?.default_sort;

  if (!filtersData) {
    if (filtersLoading) return <FilterBarSkeleton />;
    return null;
  }

  const availabilityFilter = getAvailabilityFilter(filtersData);
  const hasPriceFilter = priceBuckets.length > 0;

  return (
    <div className="mb-6">
      <div className="hidden md:flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex flex-wrap items-center gap-3">
          {TOKI_GAME_FILTER_FIELDS.map((field) => {
            const value = getTokiFilterValue(activeFilters, field.key);

            return (
              <FilterDropdown
                key={field.key}
                label={field.label}
                badgeCount={value ? 1 : 0}
                isOpen={openDropdownId === `toki-${field.key}`}
                onToggle={() => toggleDropdown(`toki-${field.key}`)}
                onClose={closeDropdown}
              >
                <div className="w-64 p-4">
                  <label
                    htmlFor={`desktop-toki-${field.key}`}
                    className="mb-2 block text-sm font-semibold text-[#245572]"
                  >
                    {field.label}
                  </label>
                  <select
                    id={`desktop-toki-${field.key}`}
                    value={value}
                    onChange={(event) =>
                      onFilterChange(
                        updateTokiFilter(
                          activeFilters,
                          field.key,
                          event.target.value,
                        ),
                      )
                    }
                    className="w-full rounded-xl border border-[#bddbea] bg-white px-3 py-2.5 text-sm text-[#245572] focus:border-[#126ca6] focus:outline-none focus:ring-2 focus:ring-[#126ca6]/20"
                  >
                    <option value="">Toate</option>
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </FilterDropdown>
            );
          })}

          {optionFilters.map((filter) => (
            <FilterDropdown
              key={filter.id}
              label={filter.label}
              badgeCount={badgeCounts[filter.id]}
              isOpen={openDropdownId === filter.id}
              onToggle={() => toggleDropdown(filter.id)}
              onClose={closeDropdown}
            >
              <OptionDropdownContent
                filter={filter}
                selectedValues={activeFilters.optionValues}
                onToggle={handleOptionValueToggle}
              />
            </FilterDropdown>
          ))}

          {hasPriceFilter && (
            <FilterDropdown
              label={t("price")}
              badgeCount={priceBadge}
              isOpen={openDropdownId === "price"}
              onToggle={() => toggleDropdown("price")}
              onClose={closeDropdown}
            >
              <PriceDropdownContent
                priceBuckets={priceBuckets}
                activeFilters={activeFilters}
                onPriceChange={handlePriceChange}
              />
            </FilterDropdown>
          )}

          <FilterDropdown
            label={t("availability")}
            badgeCount={availabilityBadge}
            isOpen={openDropdownId === "availability"}
            onToggle={() => toggleDropdown("availability")}
            onClose={closeDropdown}
          >
            <AvailabilityDropdownContent
              filter={availabilityFilter}
              selected={activeFilters.availability}
              onChange={handleAvailabilityChange}
            />
          </FilterDropdown>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {t("productCount", { count: totalCount })}
          </span>
          <FilterDropdown
            label={t("sort")}
            isOpen={openDropdownId === "sort"}
            onToggle={() => toggleDropdown("sort")}
            onClose={closeDropdown}
            align="right"
          >
            <SortDropdownContent
              sortOptions={filtersData.sort_options}
              activeSortBy={activeSortBy}
              onSortChange={handleSortChange}
            />
          </FilterDropdown>
        </div>
      </div>

      <div className="flex items-center gap-3 md:hidden pb-4 border-b border-gray-100">
        <button
          type="button"
          onClick={() => setShowMobileDrawer(true)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
            hasActiveFilters
              ? "border-gray-500 bg-gray-50 text-primary"
              : "border-gray-300 text-gray-700"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>{t("filters")}</span>
          {hasActiveFilters && (
            <span className="flex items-center justify-center w-5 h-5 text-xs bg-primary text-white rounded-lg">
              {totalActiveFilters}
            </span>
          )}
        </button>

        <div className="ml-auto">
          <FilterDropdown
            label={t("sort")}
            isOpen={openDropdownId === "sort-mobile"}
            onToggle={() => toggleDropdown("sort-mobile")}
            onClose={closeDropdown}
            align="right"
          >
            <SortDropdownContent
              sortOptions={filtersData.sort_options}
              activeSortBy={activeSortBy}
              onSortChange={handleSortChange}
            />
          </FilterDropdown>
        </div>
      </div>

      {hasActiveFilters && (
        <FilterChips
          activeFilters={activeFilters}
          filtersData={filtersData}
          priceBuckets={priceBuckets}
          onRemoveOptionValue={(id) => handleOptionValueToggle(id)}
          onRemovePrice={() => handlePriceChange(undefined, undefined)}
          onRemoveAvailability={() => handleAvailabilityChange(undefined)}
          onRemoveTokiFilter={handleRemoveTokiFilter}
          onClearAll={clearFilters}
        />
      )}

      <MobileFilterDrawer
        isOpen={showMobileDrawer}
        onClose={() => setShowMobileDrawer(false)}
        filtersData={filtersData}
        activeFilters={activeFilters}
        priceBuckets={priceBuckets}
        onApply={onFilterChange}
      />
    </div>
  );
});
