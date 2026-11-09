"use client";

import { Dice5, Rabbit, RotateCcw, Sparkles, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Game = {
  id: string;
  name: string;
  slug: string;
  price: string | null;
  image: string | null;
  tags: string[];
  categories: { name: string; permalink: string }[];
  fields: { label: string; value: string }[];
};

const cells = [
  { label: "START", icon: "🚩", keywords: [] },
  {
    label: "Strategie",
    icon: "🧠",
    keywords: ["strategie", "strategy", "strategic"],
  },
  { label: "Familie", icon: "🏡", keywords: ["familie", "family", "familial"] },
  { label: "Petrecere", icon: "🎉", keywords: ["petrecere", "party"] },
  {
    label: "Cooperare",
    icon: "🤝",
    keywords: ["cooperare", "cooperative", "co-op"],
  },
  {
    label: "Cărți",
    icon: "🃏",
    keywords: ["carti", "cards", "card game", "deck"],
  },
  { label: "Zaruri", icon: "🎲", keywords: ["zar", "dice"] },
  { label: "Aventură", icon: "🗺️", keywords: ["aventura", "adventure"] },
  {
    label: "Logică",
    icon: "🔎",
    keywords: ["logica", "logic", "puzzle", "deductie"],
  },
  { label: "Distracție", icon: "🎈", keywords: ["distractie", "fun", "umor"] },
  {
    label: "Copii",
    icon: "🧸",
    keywords: ["copii", "copil", "kids", "children"],
  },
  {
    label: "Provocare",
    icon: "🏆",
    keywords: ["provocare", "challenge", "expert"],
  },
  { label: "Tactică", icon: "⚔️", keywords: ["tactica", "tactic", "tactical"] },
  { label: "Prieteni", icon: "👥", keywords: ["prieteni", "friends"] },
  {
    label: "Surpriză",
    icon: "🎁",
    keywords: ["surpriza", "surprise", "mystery"],
  },
  { label: "FINISH", icon: "🏁", keywords: [] },
];

export function getBoardCellPosition(index: number) {
  const row = Math.floor(index / 4);
  const offset = index % 4;
  return {
    gridColumn: (row % 2 === 0 ? offset : 3 - offset) + 1,
    gridRow: 4 - row,
  };
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function getThemeSuggestion(
  position: number,
  products: Game[],
): Game | null {
  const theme = cells[position];
  if (!theme || theme.keywords.length === 0) return null;

  const matchingProducts = products.filter((product) => {
    const searchableText = normalize(
      [
        product.name,
        ...product.tags,
        ...product.categories.flatMap(({ name, permalink }) => [
          name,
          permalink,
        ]),
        ...product.fields.flatMap(({ label, value }) => [label, value]),
      ].join(" "),
    );
    return theme.keywords.some((keyword) =>
      searchableText.includes(normalize(keyword)),
    );
  });

  return matchingProducts.length
    ? matchingProducts[(position - 1) % matchingProducts.length]
    : null;
}

export function TokiBoard({ basePath }: { basePath: string }) {
  const [position, setPosition] = useState(0);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [products, setProducts] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [error, setError] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const moveTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let active = true;
    let controller: AbortController | null = null;
    const loadCatalog = async () => {
      controller = new AbortController();
      setLoading(true);
      try {
        const response = await fetch("/api/toki/catalog", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Catalog request failed");
        const data: { products: Game[] } = await response.json();
        if (active) setProducts(data.products ?? []);
      } catch {
        if (active && !controller?.signal.aborted) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (typeof IntersectionObserver === "undefined") {
      void loadCatalog();
      return () => {
        active = false;
        controller?.abort();
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        void loadCatalog();
      },
      { rootMargin: "200px" },
    );
    observer.observe(section);

    return () => {
      active = false;
      observer.disconnect();
      controller?.abort();
    };
  }, []);

  useEffect(
    () => () => {
      if (moveTimer.current) clearInterval(moveTimer.current);
    },
    [],
  );

  function roll() {
    if (position >= 15 || rolling) return;
    const value = Math.floor(Math.random() * 6) + 1;
    const target = Math.min(15, position + value);
    setLastRoll(value);
    setRolling(true);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPosition(target);
      setRolling(false);
      return;
    }

    let step = 0;
    moveTimer.current = setInterval(() => {
      step += 1;
      setPosition(position + step);
      if (position + step >= target) {
        if (moveTimer.current) clearInterval(moveTimer.current);
        moveTimer.current = null;
        setRolling(false);
      }
    }, 260);
  }

  function reset() {
    if (moveTimer.current) clearInterval(moveTimer.current);
    moveTimer.current = null;
    setRolling(false);
    setPosition(0);
    setLastRoll(null);
  }

  const theme = cells[position];
  const suggestion = getThemeSuggestion(position, products);

  return (
    <section
      ref={sectionRef}
      className="container mx-auto px-4 py-14 sm:px-6 lg:px-8"
      aria-labelledby="toki-board-title"
    >
      <div className="mx-auto max-w-5xl rounded-3xl border border-primary-100 bg-white/90 p-5 shadow-[0_8px_32px_rgb(45_77_94/7%)] sm:p-8">
        <div className="flex items-center gap-2 text-primary-700">
          <Rabbit className="size-5 text-[#c67c73]" aria-hidden="true" />
          <h2
            id="toki-board-title"
            className="font-display text-2xl font-semibold text-gray-900"
          >
            Aventura TOKI
          </h2>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Aruncă zarul, plimbă pionul pe traseu și descoperă un joc potrivit
          fiecărei teme!
        </p>

        <div className="mt-6 rounded-[2rem] border-[8px] border-[#795334] bg-[#dbe9d2] p-2 shadow-[inset_0_2px_8px_rgb(32_59_37/20%),0_8px_16px_rgb(49_65_45/12%)] sm:p-3">
          <div className="relative overflow-hidden rounded-[1.25rem] bg-[radial-gradient(ellipse_at_15%_18%,#f8f2d9_0%,transparent_32%),radial-gradient(ellipse_at_88%_82%,#d1e6ce_0%,transparent_34%),#e9eedb] p-2 sm:p-3">
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full p-3 sm:p-4"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path
                d="M12.5 87.5 H87.5 V62.5 H12.5 V37.5 H87.5 V12.5 H12.5"
                fill="none"
                stroke="#bb9858"
                strokeDasharray="1.2 1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.6"
              />
            </svg>
            <ol
              className="relative grid grid-cols-4 gap-2 sm:gap-3"
              aria-label="Traseul tablei de joc TOKI"
            >
              {cells.map((cell, index) => {
                const activeCell = position === index;
                const endpoint = index === 0 || index === 15;
                return (
                  <li
                    key={cell.label}
                    className={`relative z-10 flex min-h-[4.75rem] flex-col items-center justify-center rounded-xl border p-1.5 text-center shadow-[0_3px_0_rgb(96_70_42/16%)] transition-colors duration-200 sm:min-h-24 sm:rounded-2xl sm:p-2 ${
                      activeCell
                        ? "border-[#b56d3f] bg-[#fff0c8] ring-2 ring-[#d99554]/50"
                        : endpoint
                          ? "border-[#9cb88e] bg-[#edf4df]"
                          : "border-[#c6d6b7] bg-[#fffdf2]/95"
                    }`}
                    aria-label={`Căsuța ${index + 1}: ${cell.label}`}
                    aria-current={activeCell ? "step" : undefined}
                    style={getBoardCellPosition(index)}
                  >
                    <span className="text-[0.6rem] font-semibold text-[#6e7057] sm:text-xs">
                      {index + 1}
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-base leading-5 sm:text-xl"
                    >
                      {cell.icon}
                    </span>
                    <span className="text-[0.62rem] font-semibold leading-tight text-[#3e513d] sm:text-sm">
                      {cell.label}
                    </span>
                    {activeCell && (
                      <span
                        className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl drop-shadow-sm animate-bounce motion-reduce:animate-none"
                        style={{
                          animationDuration: "260ms",
                          animationIterationCount: 1,
                        }}
                        role="img"
                        aria-label="Pionul tău"
                      >
                        ♟
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
            <div className="pointer-events-none absolute right-4 top-4 hidden size-14 items-center justify-center rounded-full border border-[#a5b88d]/70 bg-white/35 text-3xl text-[#71825c] sm:flex">
              <span aria-hidden="true">✦</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={roll}
            disabled={position === 15 || rolling}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary-700 disabled:opacity-60"
          >
            <Dice5
              className={`size-4 ${rolling ? "motion-safe:animate-[spin_350ms_linear_infinite]" : ""}`}
              aria-hidden="true"
            />
            {rolling ? "Se rostogolește…" : "Aruncă zarul"}
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-primary-50"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            {position === 15 ? "Joacă din nou" : "Reset"}
          </button>
          <span aria-live="polite" className="text-sm text-gray-600">
            {position === 15
              ? "Felicitări! Ai ajuns la final!"
              : `Căsuța ${position + 1} / 16`}
            {lastRoll ? ` · Zar: ${lastRoll}` : ""}
          </span>
        </div>

        {position > 0 && (
          <div
            className="mt-6 rounded-2xl border border-primary-100 bg-[#f7fafc] p-4 sm:p-5"
            aria-live="polite"
          >
            <div className="flex items-center gap-2">
              {position === 15 ? (
                <Trophy className="size-5 text-[#bd8a38]" aria-hidden="true" />
              ) : (
                <Sparkles
                  className="size-5 text-[#bd8a38]"
                  aria-hidden="true"
                />
              )}
              <h3 className="font-display font-semibold text-gray-900">
                {position === 15
                  ? "Misiune îndeplinită!"
                  : `Temă: ${theme.label}`}
              </h3>
            </div>
            {loading ? (
              <p className="mt-2 text-sm text-gray-600">
                Se caută jocuri pentru această temă…
              </p>
            ) : error ? (
              <p className="mt-2 text-sm text-gray-600">
                Catalogul nu este disponibil momentan. Încearcă din nou puțin
                mai târziu.
              </p>
            ) : suggestion ? (
              <div className="mt-3 flex items-center gap-4">
                {suggestion.image && (
                  <Image
                    src={suggestion.image}
                    alt=""
                    width={80}
                    height={80}
                    sizes="80px"
                    className="size-20 rounded-lg bg-white object-contain"
                  />
                )}
                <div>
                  <Link
                    href={`${basePath}/products/${suggestion.slug}`}
                    className="font-medium underline underline-offset-2"
                  >
                    {suggestion.name}
                  </Link>
                  <p className="text-sm text-gray-600">
                    {suggestion.price ?? "Vezi detaliile produsului"}
                  </p>
                </div>
              </div>
            ) : position === 15 ? (
              <p className="mt-2 text-sm text-gray-600">
                Ai explorat tabla!{" "}
                <Link
                  href={`${basePath}/products`}
                  className="font-medium underline underline-offset-2"
                >
                  Descoperă toate jocurile.
                </Link>
              </p>
            ) : (
              <p className="mt-2 text-sm text-gray-600">
                Nu am găsit încă jocuri etichetate pentru tema „{theme.label}”.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
