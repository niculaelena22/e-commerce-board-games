
import type {
  ActiveFilters,
  AvailabilityStatus,
  GameComplexity,
  GameLanguage,
} from "@/types/filters";
import { isAvailabilityStatus } from "@/types/filters";

export const LISTING_PARAM_KEYS = {
  query: "q",
  sort: "sort",
  priceMin: "price_min",
  priceMax: "price_max",
  availability: "availability",
  option: "option",

  // Filtre TOKI
  players: "players",
  maxDuration: "max_duration",
  playerAge: "player_age",
  complexity: "complexity",
  gameLanguage: "game_language",
} as const;

const LISTING_OWNED_KEYS = new Set<string>(
  Object.values(LISTING_PARAM_KEYS),
);

export interface ListingSearchParams {
  query?: string;
  filters: ActiveFilters;
}

type RawSearchParams =
  | URLSearchParams
  | Record<string, string | string[] | undefined>;

function readFirst(
  params: RawSearchParams,
  key: string,
): string | undefined {
  if (params instanceof URLSearchParams) {
    return params.get(key) ?? undefined;
  }

  const raw = params[key];
  return Array.isArray(raw) ? raw[0] : raw;
}

function readAll(
  params: RawSearchParams,
  key: string,
): string[] {
  if (params instanceof URLSearchParams) {
    return params.getAll(key);
  }

  const raw = params[key];

  if (raw == null) return [];
  return Array.isArray(raw) ? raw : [raw];
}

function parseNonNegativeInt(
  value: string | undefined,
): number | undefined {
  if (value === undefined || !/^\d+$/.test(value)) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isSafeInteger(parsed)
    ? parsed
    : undefined;
}

function parsePositiveInt(
  value: string | undefined,
): number | undefined {
  const parsed = parseNonNegativeInt(value);

  return parsed !== undefined && parsed > 0
    ? parsed
    : undefined;
}

function parseComplexity(
  value: string | undefined,
): GameComplexity | undefined {
  if (
    value === "usor" ||
    value === "mediu" ||
    value === "avansat"
  ) {
    return value;
  }

  return undefined;
}

function parseLanguage(
  value: string | undefined,
): GameLanguage | undefined {
  if (value === "romana" || value === "engleza") {
    return value;
  }

  return undefined;
}

export function parseListingSearchParams(
  params: RawSearchParams,
): ListingSearchParams {
  const query =
    readFirst(params, LISTING_PARAM_KEYS.query)?.trim() ||
    undefined;

  const availabilityRaw = readFirst(
    params,
    LISTING_PARAM_KEYS.availability,
  );

  const availability: AvailabilityStatus | undefined =
    availabilityRaw && isAvailabilityStatus(availabilityRaw)
      ? availabilityRaw
      : undefined;

  const priceMin = parseNonNegativeInt(
    readFirst(params, LISTING_PARAM_KEYS.priceMin),
  );

  const priceMax = parseNonNegativeInt(
    readFirst(params, LISTING_PARAM_KEYS.priceMax),
  );

  const optionValues = readAll(
    params,
    LISTING_PARAM_KEYS.option,
  ).filter(Boolean);

  const sortBy =
    readFirst(params, LISTING_PARAM_KEYS.sort)?.trim() ||
    undefined;

  const players = parsePositiveInt(
    readFirst(params, LISTING_PARAM_KEYS.players),
  );

  const maxDuration = parsePositiveInt(
    readFirst(params, LISTING_PARAM_KEYS.maxDuration),
  );

  const playerAge = parsePositiveInt(
    readFirst(params, LISTING_PARAM_KEYS.playerAge),
  );

  const complexity = parseComplexity(
    readFirst(params, LISTING_PARAM_KEYS.complexity),
  );

  const gameLanguage = parseLanguage(
    readFirst(params, LISTING_PARAM_KEYS.gameLanguage),
  );

  const filters: ActiveFilters = {
    optionValues,
    ...(priceMin !== undefined ? { priceMin } : {}),
    ...(priceMax !== undefined ? { priceMax } : {}),
    ...(availability ? { availability } : {}),
    ...(sortBy ? { sortBy } : {}),
    ...(players !== undefined ? { players } : {}),
    ...(maxDuration !== undefined ? { maxDuration } : {}),
    ...(playerAge !== undefined ? { playerAge } : {}),
    ...(complexity ? { complexity } : {}),
    ...(gameLanguage ? { gameLanguage } : {}),
  };

  return { query, filters };
}

export function buildListingSearchParams(
  base: URLSearchParams,
  next: Partial<ListingSearchParams> & {
    query?: string;
  },
): URLSearchParams {
  const out = new URLSearchParams();

  // Păstrăm parametrii care nu aparțin filtrelor.
  for (const [key, value] of base.entries()) {
    if (!LISTING_OWNED_KEYS.has(key)) {
      out.append(key, value);
    }
  }

  if (next.query) {
    out.set(LISTING_PARAM_KEYS.query, next.query);
  }

  const filters = next.filters;

  if (filters) {
    if (filters.priceMin !== undefined) {
      out.set(
        LISTING_PARAM_KEYS.priceMin,
        String(filters.priceMin),
      );
    }

    if (filters.priceMax !== undefined) {
      out.set(
        LISTING_PARAM_KEYS.priceMax,
        String(filters.priceMax),
      );
    }

    if (filters.availability) {
      out.set(
        LISTING_PARAM_KEYS.availability,
        filters.availability,
      );
    }

    if (filters.sortBy) {
      out.set(LISTING_PARAM_KEYS.sort, filters.sortBy);
    }

    for (const optionValue of filters.optionValues) {
      out.append(LISTING_PARAM_KEYS.option, optionValue);
    }

    // Filtre TOKI
    if (filters.players !== undefined) {
      out.set(
        LISTING_PARAM_KEYS.players,
        String(filters.players),
      );
    }

    if (filters.maxDuration !== undefined) {
      out.set(
        LISTING_PARAM_KEYS.maxDuration,
        String(filters.maxDuration),
      );
    }

    if (filters.playerAge !== undefined) {
      out.set(
        LISTING_PARAM_KEYS.playerAge,
        String(filters.playerAge),
      );
    }

    if (filters.complexity) {
      out.set(
        LISTING_PARAM_KEYS.complexity,
        filters.complexity,
      );
    }

    if (filters.gameLanguage) {
      out.set(
        LISTING_PARAM_KEYS.gameLanguage,
        filters.gameLanguage,
      );
    }
  }

  return out;
}

export function listingKey(
  state: ListingSearchParams,
): string {
  return JSON.stringify({
    q: state.query ?? "",
    s: state.filters.sortBy ?? "",
    pMin: state.filters.priceMin ?? "",
    pMax: state.filters.priceMax ?? "",
    a: state.filters.availability ?? "",
    o: [...state.filters.optionValues].sort(),

    // Filtre TOKI
    players: state.filters.players ?? "",
    duration: state.filters.maxDuration ?? "",
    age: state.filters.playerAge ?? "",
    complexity: state.filters.complexity ?? "",
    language: state.filters.gameLanguage ?? "",
  });
}
