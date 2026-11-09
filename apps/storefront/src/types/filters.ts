export type AvailabilityStatus = "in_stock" | "out_of_stock";

export const AVAILABILITY_STATUSES: ReadonlySet<string> = new Set<string>([
  "in_stock",
  "out_of_stock",
]);

export function isAvailabilityStatus(
  value: string,
): value is AvailabilityStatus {
  return AVAILABILITY_STATUSES.has(value);
}

export type GameComplexity = "usor" | "mediu" | "avansat";

export type GameLanguage = "romana" | "engleza";

export type TokiFilterKey =
  | "players"
  | "maxDuration"
  | "playerAge"
  | "complexity"
  | "gameLanguage";

export interface ActiveFilters {
  // Filtrele existente Spree
  priceMin?: number;
  priceMax?: number;
  optionValues: string[];
  availability?: AvailabilityStatus;
  sortBy?: string;

  // Filtrele specifice TOKI
  players?: number;
  maxDuration?: number;
  playerAge?: number;
  complexity?: GameComplexity;
  gameLanguage?: GameLanguage;
}
