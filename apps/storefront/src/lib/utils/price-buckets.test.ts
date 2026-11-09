import { describe, expect, it } from "vitest";
import { generatePriceBuckets } from "./price-buckets";

describe("generatePriceBuckets", () => {
  it("provides all standard price ranges even when the catalog range is narrow", () => {
    const buckets = generatePriceBuckets("RON");

    expect(buckets.map(({ id }) => id)).toEqual([
      "under-50",
      "50-100",
      "100-200",
      "200-500",
      "500-plus",
    ]);
    expect(buckets.map(({ min, max }) => ({ min, max }))).toEqual([
      { min: undefined, max: 50 },
      { min: 50, max: 100 },
      { min: 100, max: 200 },
      { min: 200, max: 500 },
      { min: 500, max: undefined },
    ]);
  });
});
