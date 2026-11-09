import { describe, expect, it } from "vitest";
import { getBoardCellPosition, getThemeSuggestion } from "./TokiBoard";

const products = [
  {
    id: "prod_strategy",
    name: "Joc de strategie",
    slug: "joc-strategie",
    price: null,
    image: null,
    tags: [],
    categories: [],
    fields: [],
  },
  {
    id: "prod_adventure",
    name: "Aventură în pădure",
    slug: "aventura-padure",
    price: null,
    image: null,
    tags: [],
    categories: [],
    fields: [],
  },
  {
    id: "prod_family",
    name: "Joc pentru toată familia",
    slug: "joc-familie",
    price: null,
    image: null,
    tags: [],
    categories: [{ name: "Jocuri de familie", permalink: "familie" }],
    fields: [],
  },
];

describe("TOKI game board", () => {
  it("lays out all sixteen spaces in a connected serpentine path", () => {
    const positions = Array.from({ length: 16 }, (_, index) =>
      getBoardCellPosition(index),
    );

    expect(
      new Set(
        positions.map(({ gridColumn, gridRow }) => `${gridColumn}:${gridRow}`),
      ).size,
    ).toBe(16);
    expect(positions[0]).toEqual({ gridColumn: 1, gridRow: 4 });
    expect(positions[3]).toEqual({ gridColumn: 4, gridRow: 4 });
    expect(positions[4]).toEqual({ gridColumn: 4, gridRow: 3 });
    expect(positions[7]).toEqual({ gridColumn: 1, gridRow: 3 });
    expect(positions[15]).toEqual({ gridColumn: 1, gridRow: 1 });
  });

  it("recommends products whose catalog themes match the occupied space", () => {
    expect(getThemeSuggestion(7, products)?.slug).toBe("aventura-padure");
    expect(getThemeSuggestion(2, products)?.slug).toBe("joc-familie");
    expect(getThemeSuggestion(1, products)?.slug).toBe("joc-strategie");
  });

  it("does not recommend an unrelated game when a theme has no matches", () => {
    expect(getThemeSuggestion(3, products)).toBeNull();
    expect(getThemeSuggestion(0, products)).toBeNull();
    expect(getThemeSuggestion(15, products)).toBeNull();
  });
});
