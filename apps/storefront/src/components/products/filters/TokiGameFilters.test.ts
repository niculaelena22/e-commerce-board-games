import { describe, expect, it } from "vitest";
import { buildProductQueryParams } from "@/lib/utils/product-query";
import {
  getTokiFilterValue,
  TOKI_GAME_FILTER_FIELDS,
  updateTokiFilter,
} from "./TokiGameFilters";

describe("TOKI game filter controls", () => {
  it("exposes each game filter separately", () => {
    expect(TOKI_GAME_FILTER_FIELDS.map(({ key }) => key)).toEqual([
      "players",
      "maxDuration",
      "playerAge",
      "complexity",
      "gameLanguage",
    ]);
  });

  it("updates numeric filters and clears a selected value", () => {
    const filters = updateTokiFilter({ optionValues: [] }, "players", "4");

    expect(filters.players).toBe(4);
    expect(getTokiFilterValue(filters, "players")).toBe("4");
    expect(updateTokiFilter(filters, "players", "").players).toBeUndefined();
  });

  it("updates and clears text filters", () => {
    const filters = updateTokiFilter(
      { optionValues: [] },
      "gameLanguage",
      "romana",
    );

    expect(filters.gameLanguage).toBe("romana");
    expect(
      updateTokiFilter(filters, "gameLanguage", "").gameLanguage,
    ).toBeUndefined();
  });

  it("uses the selected player's age as an upper bound for game minimum age", () => {
    expect(
      buildProductQueryParams({ optionValues: [], playerAge: 12 }, undefined)
        .cf_custom_min_age_lteq,
    ).toBe("12");
  });
});
