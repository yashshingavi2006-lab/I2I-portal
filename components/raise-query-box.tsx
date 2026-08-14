"use client";

import { useState } from "react";

export function RaiseQueryBox() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!message.trim()) {
      setError("Write your query before submitting.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/raise-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Couldn't send your query.");
      setSent(true);
      setMessage("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-marigold/25 bg-marigold/10 p-6 text-center">
        <p className="text-sm font-medium text-ink">
          ✓ Your query has been sent — we&apos;ll get back to you soon.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-2 text-xs font-medium text-marigold hover:underline"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-line bg-surface p-6 sm:p-8">
      <h3 className="font-display text-base font-semibold text-ink">
        Have a question or ran into an issue?
      </h3>
      <p className="mt-1 text-sm text-muted">
        Raise a query below and it goes straight to the i2i team&apos;s inbox.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-marigold"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email (optional, so we can reply)"
          className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-marigold"
        />
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your query here..."
        rows={4}
        className="mt-3 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-marigold"
      />
      {error && <p className="mt-2 text-xs font-medium text-red-500">{error}</p>}
      <button
        onClick={submit}
        disabled={submitting}
        className="mt-3 rounded-lg bg-marigold px-5 py-2.5 text-sm font-semibold text-ink transition hover:brightness-95 disabled:opacity-60"
      >
        {submitting ? "Sending..." : "Raise Query"}
      </button>
    </div>
  );
}
