"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Dice5, Rabbit, RotateCcw } from "lucide-react";

type Game = { id: string; name: string; slug: string; price: string | null; image: string | null };
const cells = ["START", "Strategie", "Familie", "Petrecere", "Cooperare", "Cărți", "Zaruri", "Aventură", "Logică", "Distracție", "Copii", "Provocare", "Tactică", "Prieteni", "Surpriză", "FINISH"];

export function TokiBoard({ basePath }: { basePath: string }) {
  const [position, setPosition] = useState(0);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [products, setProducts] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    fetch("/api/toki/catalog").then(async (r) => { if (!r.ok) throw new Error("catalog"); return r.json(); })
      .then((data: { products: Game[] }) => { if (active) setProducts(data.products ?? []); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  function roll() {
    if (position === 15) return;
    const value = Math.floor(Math.random() * 6) + 1;
    setLastRoll(value);
    setPosition((current) => Math.min(15, current + value));
  }
  function reset() { setPosition(0); setLastRoll(null); }
  const suggestion = products.length ? products[(Math.max(position - 1, 0)) % products.length] : null;
  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-14" aria-labelledby="toki-board-title">
      <div className="mx-auto max-w-4xl rounded-3xl border border-primary-100 bg-white/90 p-5 shadow-[0_8px_32px_rgb(45_77_94/7%)] sm:p-8">
        <div className="flex items-center gap-2 text-primary-700"><Rabbit className="size-5 text-[#c67c73]" aria-hidden="true" /><h2 id="toki-board-title" className="font-display text-2xl font-semibold text-gray-900">Aventura TOKI</h2></div>
        <p className="mt-2 text-sm text-gray-600">Aruncă zarul, explorează tabla și descoperă jocuri din magazin!</p>
        <div className="mt-6 grid grid-cols-4 gap-2 sm:gap-3">
          {cells.map((cell, index) => (
            <div key={cell} className={`flex min-h-20 flex-col items-center justify-center rounded-2xl border p-2 text-center sm:min-h-24 ${position === index ? "border-[#d5ad68] bg-[#fbf2da]" : "border-primary-100 bg-[#f5f9fc]"}`} aria-current={position === index ? "step" : undefined}>
              <span className="text-xs text-gray-500">{index + 1}</span>
              <span className="mt-1 text-xs font-medium text-gray-800 sm:text-sm">{cell}</span>
              {position === index && <span className="mt-1 text-xl" aria-label="Pionul tău">♟</span>}
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="button" onClick={roll} disabled={position === 15} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary-700 disabled:opacity-50"><Dice5 className="h-4 w-4" /> Aruncă zarul</button>
          <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-primary-50"><RotateCcw className="h-4 w-4" /> {position === 15 ? "Joacă din nou" : "Reset"}</button>
          <span aria-live="polite" className="text-sm text-gray-600">{position === 15 ? "Felicitări! Ai ajuns la final!" : `Căsuța ${position + 1} / 16`}{lastRoll ? ` · Zar: ${lastRoll}` : ""}</span>
        </div>
        {position > 0 && <div className="mt-6 rounded-2xl border border-primary-100 bg-[#f7fafc] p-4" aria-live="polite">
          <h3 className="font-display font-semibold text-gray-900">Recomandarea căsuței</h3>
          {loading ? <p className="mt-2 text-sm">Se încarcă jocurile…</p> : error ? <p className="mt-2 text-sm">Catalogul nu este disponibil momentan.</p> : suggestion ? <div className="mt-2 flex items-center gap-4">
            {suggestion.image && <img src={suggestion.image} alt="" className="h-20 w-20 rounded-lg object-contain" />}
            <div><Link href={`${basePath}/products/${suggestion.slug}`} className="font-medium underline underline-offset-2">{suggestion.name}</Link><p className="text-sm text-gray-600">{suggestion.price ?? "Vezi detaliile produsului"}</p></div>
          </div> : <p className="mt-2 text-sm">Adaugă produse în Spree pentru a primi recomandări.</p>}
        </div>}
      </div>
    </section>
  );
}
