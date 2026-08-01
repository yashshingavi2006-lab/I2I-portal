export function WorkspaceTab({ status }: { status: string }) {
  const phases = [
    { n: 1, label: "Phase 1 - Registration", done: true },
    { n: 2, label: "Phase 2 - Proposal & Funding", done: ["shortlisted_phase3", "funded", "completed"].includes(status) },
    { n: 3, label: "Phase 3 - Development", done: ["funded", "completed"].includes(status) },
    { n: 4, label: "Phase 4 - Final Evaluation", done: status === "completed" },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <div className="rounded-2xl border border-line bg-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          i2i Gates Tracker
        </p>
        <div className="mt-3 space-y-1.5">
          {phases.map((p) => (
            <div
              key={p.n}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                p.done ? "bg-marigold/15 text-marigold" : "text-muted"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  p.done ? "bg-marigold text-ink" : "border border-line"
                }`}
              >
                {p.done ? "✓" : p.n}
              </span>
              {p.label}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
        <p className="font-display text-lg font-semibold text-ink">
          Workspace — timeline & daily logging coming next
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Approved funding, assigned mentor/ambassador, and the daily progress timeline will
          appear here once your team reaches Phase 3.
        </p>
      </div>
    </div>
  );
}
