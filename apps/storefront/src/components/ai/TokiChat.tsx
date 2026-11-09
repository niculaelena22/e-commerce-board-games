"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { type FormEvent, useState } from "react";

type Product = {
  name: string;
  slug: string;
  price: number | null;
  currency: string | null;
  url: string;
};
type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  products?: Product[];
};

export default function TokiChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Bună! 🐰 Sunt TOKI AI. Spune-mi câți jucători sunteți, ce buget ai sau ce fel de joc cauți!",
    },
  ]);
  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = input.trim();
    if (!message || busy) return;
    setInput("");
    setMessages((old) => [...old, { role: "user", text: message }]);
    setBusy(true);
    try {
      const response = await fetch("/api/toki-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = (await response.json()) as {
        reply?: string;
        error?: string;
        products?: Product[];
      };
      setMessages((old) => [
        ...old,
        {
          role: "assistant",
          text: data.reply || data.error || "Nu am putut răspunde.",
          products: data.products,
        },
      ]);
    } catch {
      setMessages((old) => [
        ...old,
        { role: "assistant", text: "Conexiunea a eșuat. Încearcă din nou." },
      ]);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {open && (
        <section
          aria-label="Asistent TOKI AI"
          className="mb-3 flex h-[min(540px,75vh)] w-[min(370px,calc(100vw-40px))] flex-col overflow-hidden rounded-3xl border border-orange-200 bg-[#fffaf1] shadow-2xl"
        >
          <header className="flex items-center justify-between bg-[#a94428] px-4 py-3 text-white">
            <div>
              <div className="font-bold">🐰 TOKI AI</div>
              <div className="text-xs text-orange-100">
                Te ajut să alegi jocul potrivit
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Închide chatul"
              className="rounded-lg p-2 hover:bg-white/20"
            >
              <X size={20} />
            </button>
          </header>
          <div
            role="log"
            aria-live="polite"
            className="flex-1 space-y-3 overflow-y-auto p-4"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`max-w-[95%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${message.role === "user" ? "ml-auto bg-[#f5d6b6] text-[#432414]" : "mr-auto bg-white text-[#432414] shadow-sm"}`}
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
                {message.products?.map((p) => (
                  <div
                    key={p.slug}
                    className="mt-3 border-t border-orange-100 pt-2"
                  >
                    <p className="font-semibold">🎲 {p.name}</p>
                    <p className="mt-1">
                      {p.price !== null && p.currency
                        ? new Intl.NumberFormat("ro-RO", {
                            style: "currency",
                            currency: p.currency,
                          }).format(p.price)
                        : "Preț indisponibil"}
                    </p>
                    <a
                      href={p.url}
                      className="mt-1 inline-block font-semibold text-[#a94428] underline underline-offset-2"
                    >
                      Vezi produsul
                    </a>
                  </div>
                ))}
              </div>
            ))}
            {busy && (
              <p className="text-sm text-stone-500">TOKI se gândește…</p>
            )}
          </div>
          <form
            onSubmit={send}
            className="flex gap-2 border-t border-orange-100 bg-white p-3"
          >
            <input
              aria-label="Mesaj pentru TOKI AI"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={500}
              placeholder="Ce joc îmi recomanzi?"
              className="min-w-0 flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-orange-600"
            />
            <button
              disabled={busy || !input.trim()}
              type="submit"
              aria-label="Trimite mesajul"
              className="rounded-xl bg-[#a94428] p-2 text-white disabled:opacity-40"
            >
              <Send size={19} />
            </button>
          </form>
        </section>
      )}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Închide TOKI AI" : "Deschide TOKI AI"}
        className="ml-auto flex items-center gap-2 rounded-full bg-[#a94428] px-5 py-3 font-semibold text-white shadow-lg hover:bg-[#87341f]"
      >
        <MessageCircle size={20} /> 🐰 TOKI AI
      </button>
    </div>
  );
}
