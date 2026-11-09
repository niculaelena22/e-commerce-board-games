export interface PriceBucket {
  id: string;
  label: string;
  min?: number;
  max?: number;
}

const PRICE_RANGES = [
  { id: "under-50", max: 50, kind: "under" },
  { id: "50-100", min: 50, max: 100, kind: "range" },
  { id: "100-200", min: 100, max: 200, kind: "range" },
  { id: "200-500", min: 200, max: 500, kind: "range" },
  { id: "500-plus", min: 500, kind: "above" },
] as const;

function formatCurrency(
  amount: number,
  currency: string,
  locale?: string,
): string {
  try {
    return new Intl.NumberFormat(locale || "en", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

/**
 * Optional translation helpers for bucket labels.
 * Pass `t` from `useTranslations("products")` and a locale string
 * to get labels like "Poniżej $50" instead of "Under $50".
 */
interface BucketLabelOptions {
  t?: (key: string, values?: Record<string, string>) => string;
  locale?: string;
}

/**
 * Fixed price buckets keep the same useful choices available even when the
 * current catalog only contains products in one price range.
 */
export function generatePriceBuckets(
  currency: string,
  options?: BucketLabelOptions,
): PriceBucket[] {
  const { t, locale } = options || {};
  return PRICE_RANGES.map((bucket) => {
    if (bucket.kind === "under") {
      const { id, max } = bucket;
      const price = formatCurrency(max, currency, locale);
      return {
        id,
        label: t ? t("priceUnder", { price }) : `Under ${price}`,
        max,
      };
    }

    if (bucket.kind === "above") {
      const { id, min } = bucket;
      const price = formatCurrency(min, currency, locale);
      return {
        id,
        label: t ? t("priceAbove", { price }) : `${price}+`,
        min,
      };
    }

    const { id, min, max } = bucket;
    const minLabel = formatCurrency(min, currency, locale);
    const maxLabel = formatCurrency(max, currency, locale);

    return {
      id,
      label: t
        ? t("priceRangeBucket", { min: minLabel, max: maxLabel })
        : `${minLabel} - ${maxLabel}`,
      min,
      max,
    };
  });
}

export function findMatchingBucket(
  buckets: PriceBucket[],
  priceMin?: number,
  priceMax?: number,
): PriceBucket | undefined {
  return buckets.find(
    (b) =>
      (b.min === undefined ? priceMin === undefined : b.min === priceMin) &&
      (b.max === undefined ? priceMax === undefined : b.max === priceMax),
  );
}
