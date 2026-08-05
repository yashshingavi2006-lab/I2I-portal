"use client";

const STEPS = [
  { n: 1, label: "Team" },
  { n: 2, label: "Location" },
  { n: 3, label: "Sector" },
  { n: 4, label: "Project" },
  { n: 5, label: "Review" },
  { n: 6, label: "Password" },
];

export function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {STEPS.map((step, i) => (
        <div key={step.n} className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-sm font-semibold transition ${
                step.n === current
                  ? "bg-ink text-paper"
                  : step.n < current
                  ? "bg-marigold text-ink"
                  : "border border-line bg-surface text-muted"
              }`}
            >
              {step.n < current ? "✓" : step.n}
            </div>
            <span
              className={`hidden text-sm sm:inline ${
                step.n === current ? "font-semibold text-ink" : "text-muted"
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`h-px w-4 sm:w-10 ${
                step.n < current ? "bg-marigold" : "bg-line"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
