"use client";

const PHASES = [
  { n: 1, label: "Phase 1 – Registration", active: true },
  { n: 2, label: "Phase 2 – Proposal & Funding", active: false },
  { n: 3, label: "Phase 3 – Development", active: false },
  { n: 4, label: "Phase 4 – Final Evaluation", active: false },
];

const MANAGEMENT = [
  { label: "Edit Requests", active: false },
  { label: "Phase Engine", active: false },
  { label: "Email Templates", active: false },
  { label: "Audit Logs", active: false },
  { label: "Users & Access", active: false },
];

export function SecretarySidebar() {
  return (
    <aside className="w-64 shrink-0 border-r border-line bg-surface p-5">
      <div className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">
          Overview
        </p>
        <button className="mt-2 w-full rounded-lg bg-marigold/15 px-3 py-2 text-left text-sm font-medium text-marigold">
          Overview Summary
        </button>
      </div>

      <div className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">
          Competition Flow
        </p>
        <div className="mt-2 space-y-1">
          {PHASES.map((p) => (
            <button
              key={p.n}
              disabled={!p.active}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                p.active
                  ? "bg-marigold text-ink font-semibold"
                  : "cursor-not-allowed text-muted/50"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  p.active ? "bg-ink/20" : "border border-line"
                }`}
              >
                {p.n}
              </span>
              {p.label}
              {!p.active && (
                <span className="ml-auto text-[9px] uppercase tracking-wide text-muted/50">
                  Soon
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">
          Management
        </p>
        <div className="mt-2 space-y-1">
          {MANAGEMENT.map((m) => (
            <button
              key={m.label}
              disabled
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-muted/50"
            >
              {m.label}
              <span className="text-[9px] uppercase tracking-wide">Soon</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
