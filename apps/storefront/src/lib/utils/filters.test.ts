import { describe, expect, it } from "vitest";
import {
  clearActiveFilters,
  filtersEqual,
  getActiveFilterCount,
  getAvailabilityFilter,
  removeTokiFilter,
} from "./filters";

describe("TOKI active filters", () => {
  it("counts each active game filter", () => {
    expect(
      getActiveFilterCount({
        optionValues: [],
        players: 4,
        maxDuration: 60,
        playerAge: 10,
        complexity: "mediu",
        gameLanguage: "romana",
      }),
    ).toBe(5);
  });

  describe("availability filter fallback", () => {
    it("keeps availability choices available when the API omits empty facets", () => {
      expect(getAvailabilityFilter(null)).toEqual({
        id: "availability",
        type: "availability",
        options: [
          { id: "in_stock", count: 0 },
          { id: "out_of_stock", count: 0 },
        ],
      });
    });
  });

  it("includes TOKI values in equality and can remove a single one", () => {
    const filters = {
      optionValues: [],
      players: 4,
      gameLanguage: "romana" as const,
    };

    expect(filtersEqual(filters, { ...filters, players: 3 })).toBe(false);
    expect(removeTokiFilter(filters, "players")).toEqual({
      optionValues: [],
      gameLanguage: "romana",
    });
  });

  it("clears every filter while preserving sort order", () => {
    expect(
      clearActiveFilters({
        optionValues: ["option-1"],
        priceMin: 5,
        availability: "in_stock",
        players: 4,
        maxDuration: 60,
        playerAge: 10,
        complexity: "mediu",
        gameLanguage: "romana",
        sortBy: "-available_on",
      }),
    ).toEqual({ optionValues: [], sortBy: "-available_on" });
  });
});
