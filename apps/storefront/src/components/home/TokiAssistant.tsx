"use client";

import { Bot, Send } from "lucide-react";
import { type FormEvent, useState } from "react";

type ChatEntry = { role: "user" | "assistant"; text: string };
export function TokiAssistant() {
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = message.trim();
    if (!question || busy) return;
    setMessage("");
    setEntries((old) => [...old, { role: "user", text: question }]);
    setBusy(true);
    try {
      const response = await fetch("/api/toki/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question }),
      });
      const data: { answer?: string; error?: string } = await response.json();
      setEntries((old) => [
        ...old,
        {
          role: "assistant",
          text: data.answer ?? data.error ?? "Nu am primit un răspuns.",
        },
      ]);
    } catch {
      setEntries((old) => [
        ...old,
        { role: "assistant", text: "Conexiunea a eșuat. Încearcă din nou." },
      ]);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16"
      aria-labelledby="toki-ai-title"
    >
      <div className="mx-auto max-w-4xl rounded-3xl border border-primary-100 bg-white/90 p-5 shadow-[0_8px_32px_rgb(45_77_94/7%)] sm:p-8">
        <div className="flex items-center gap-3 text-primary-700">
          <Bot className="h-6 w-6" />
          <h2
            id="toki-ai-title"
            className="font-display text-2xl font-semibold text-gray-900"
          >
            Asistentul TOKI
          </h2>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Spune-mi câți jucători sunteți, cât timp aveți și ce fel de joc
          preferați.
        </p>
        <div
          className="mt-5 max-h-80 space-y-3 overflow-y-auto"
          aria-live="polite"
        >
          {entries.map((entry, index) => (
            <div
              key={index}
              className={`rounded-2xl p-3 text-sm whitespace-pre-wrap ${entry.role === "user" ? "ml-8 bg-primary text-primary-foreground" : "mr-8 bg-secondary text-secondary-foreground"}`}
            >
              {entry.text}
            </div>
          ))}
          {busy && (
            <p className="text-sm text-gray-500">
              TOKI pregătește recomandarea…
            </p>
          )}
        </div>
        <form onSubmit={submit} className="mt-5 flex gap-2">
          <label htmlFor="toki-ai-question" className="sr-only">
            Întreabă asistentul TOKI
          </label>
          <input
            id="toki-ai-question"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={600}
            placeholder="Ex.: Un joc de strategie pentru 4 persoane"
            className="min-w-0 flex-1 rounded-xl border border-primary-200 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
          <button
            type="submit"
            disabled={!message.trim() || busy}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm text-primary-foreground shadow-sm disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Trimite</span>
          </button>
        </form>
        <p className="mt-3 text-xs text-gray-500">
          Recomandările AI sunt orientative și folosesc catalogul TOKI.
        </p>
      </div>
    </section>
  );
}
