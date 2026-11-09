import { describe, expect, it } from "vitest";
import { buildProductQueryParams, wrapInRansackParams } from "./product-query";

describe("buildProductQueryParams TOKI filters", () => {
  it("builds range predicates for players, duration, and age", () => {
    const params = buildProductQueryParams(
      {
        optionValues: [],
        players: 4,
        maxDuration: 60,
        playerAge: 12,
      },
      undefined,
    );

    expect(params).toMatchObject({
      cf_custom_min_players_lteq: "4",
      cf_custom_max_players_gteq: "4",
      cf_custom_max_play_time_lteq: "60",
      cf_custom_min_age_lteq: "12",
    });
  });

  it("maps display values to searchable catalog terms", () => {
    const params = buildProductQueryParams(
      {
        optionValues: [],
        complexity: "mediu",
        gameLanguage: "romana",
      },
      undefined,
    );

    expect(params).toMatchObject({
      cf_custom_complexity_i_cont: "med",
      cf_custom_game_language_i_cont: "rom",
    });

    const flatParams: Record<string, unknown> = { ...params };
    expect(wrapInRansackParams(flatParams)).toMatchObject({
      "q[cf_custom_complexity_i_cont]": "med",
      "q[cf_custom_game_language_i_cont]": "rom",
    });
  });
});
