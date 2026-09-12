"use client";

import { useRef, useState } from "react";

type RowResult = { email: string; status: "created" | "skipped" | "error"; detail: string };

export function Phase1ImportPanel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<RowResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    setResults(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/secretary/phase1-import", { method: "POST", body });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || `Import failed (${res.status})`);
      setResults(json.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed. Try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const created = results?.filter((r) => r.status === "created").length ?? 0;
  const skipped = results?.filter((r) => r.status === "skipped").length ?? 0;
  const errored = results?.filter((r) => r.status === "error").length ?? 0;

  return (
    <div className="mb-6 rounded-2xl border border-line bg-surface p-6">
      <h2 className="font-display text-base font-semibold text-ink">
        Import Phase 1 Registrations
      </h2>
      <p className="mt-1 text-xs text-muted">
        Export the Google Form responses as .xlsx and upload here to create each team&apos;s
        registration and portal login in one step, instead of entering them by hand.
      </p>
      <p className="mt-2 text-xs text-muted">
        Required columns: Team Name, Leader Name, Leader Email, Leader Phone, State, City,
        College Name, Sector, Project Name, Problem Statement, Proposed Solution, Target
        Beneficiaries. Optional: Team Size, Leader Gender/DOB, Emergency Contact, College Type,
        Faculty Contact, Sub Theme, Innovation Notes, Idea Stage, and Member 2/3 Name/Email/
        Phone/Year. Login = leader email, initial password = lastname_projectcode (lowercased);
        a confirmation email is queued for each row created.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx"
        className="hidden"
        id="phase1-import"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
        }}
      />
      <label
        htmlFor="phase1-import"
        className={`mt-3 inline-block cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold transition ${
          uploading ? "cursor-not-allowed bg-line text-muted" : "bg-marigold text-ink hover:opacity-90"
        }`}
        onClick={(e) => uploading && e.preventDefault()}
      >
        {uploading ? "Importing..." : "⬆ Upload Registrations Spreadsheet"}
      </label>

      {error && <p className="mt-2 text-xs font-medium text-red-500">{error}</p>}

      {results && (
        <div className="mt-3 space-y-1.5 text-xs">
          <p className="font-medium text-ink-light">
            ✓ Created: {created} · ⏭ Skipped (already existed): {skipped} · ✕ Errors: {errored}
          </p>
          <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-line bg-surface p-2">
            {results.map((r, i) => (
              <p
                key={i}
                className={
                  r.status === "created"
                    ? "text-ink-light"
                    : r.status === "skipped"
                      ? "text-muted"
                      : "text-red-400"
                }
              >
                {r.email}: {r.detail}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
