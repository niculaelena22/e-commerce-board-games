"use client";

import type { ActiveFilters, TokiFilterKey } from "@/types/filters";

export interface TokiGameFilterField {
  key: TokiFilterKey;
  label: string;
  options: { label: string; value: string | number }[];
}

export const TOKI_GAME_FILTER_FIELDS: TokiGameFilterField[] = [
  {
    key: "players",
    label: "Număr de jucători",
    options: [1, 2, 3, 4, 5, 6].map((value) => ({
      label: `${value} ${value === 1 ? "jucător" : "jucători"}`,
      value,
    })),
  },
  {
    key: "maxDuration",
    label: "Durată maximă",
    options: [30, 60, 90, 120].map((value) => ({
      label: `${value} minute`,
      value,
    })),
  },
  {
    key: "playerAge",
    label: "Vârsta jucătorului",
    options: [6, 8, 10, 12, 14, 16].map((value) => ({
      label: `${value} ani`,
      value,
    })),
  },
  {
    key: "complexity",
    label: "Complexitate",
    options: [
      { label: "Ușor", value: "usor" },
      { label: "Mediu", value: "mediu" },
      { label: "Avansat", value: "avansat" },
    ],
  },
  {
    key: "gameLanguage",
    label: "Limba jocului",
    options: [
      { label: "Română", value: "romana" },
      { label: "Engleză", value: "engleza" },
    ],
  },
];

export function getTokiFilterValue(
  filters: ActiveFilters,
  key: TokiFilterKey,
): string {
  const value = filters[key];
  return value === undefined ? "" : String(value);
}

export function updateTokiFilter(
  filters: ActiveFilters,
  key: TokiFilterKey,
  rawValue: string,
): ActiveFilters {
  switch (key) {
    case "players":
      return {
        ...filters,
        players: rawValue === "" ? undefined : Number(rawValue),
      };
    case "maxDuration":
      return {
        ...filters,
        maxDuration: rawValue === "" ? undefined : Number(rawValue),
      };
    case "playerAge":
      return {
        ...filters,
        playerAge: rawValue === "" ? undefined : Number(rawValue),
      };
    case "complexity":
      return {
        ...filters,
        complexity:
          rawValue === "usor" || rawValue === "mediu" || rawValue === "avansat"
            ? rawValue
            : undefined,
      };
    case "gameLanguage":
      return {
        ...filters,
        gameLanguage:
          rawValue === "romana" || rawValue === "engleza"
            ? rawValue
            : undefined,
      };
  }
}
