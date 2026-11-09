import { describe, expect, it } from "vitest";
import {
  buildListingSearchParams,
  listingKey,
  parseListingSearchParams,
} from "./listing-search-params";

describe("TOKI listing search params", () => {
  it("parses, serializes, and keys all game filters", () => {
    const state = parseListingSearchParams(
      new URLSearchParams(
        "q=family&players=4&max_duration=60&player_age=10&complexity=mediu&game_language=romana",
      ),
    );

    expect(state.filters).toMatchObject({
      players: 4,
      maxDuration: 60,
      playerAge: 10,
      complexity: "mediu",
      gameLanguage: "romana",
    });

    const params = buildListingSearchParams(
      new URLSearchParams("campaign=spring"),
      state,
    );

    expect(params.toString()).toContain("players=4");
    expect(params.toString()).toContain("max_duration=60");
    expect(params.toString()).toContain("player_age=10");
    expect(params.toString()).toContain("complexity=mediu");
    expect(params.toString()).toContain("game_language=romana");
    expect(params.get("campaign")).toBe("spring");
    expect(listingKey(state)).not.toBe(
      listingKey({
        ...state,
        filters: { ...state.filters, players: 5 },
      }),
    );
  });
});
