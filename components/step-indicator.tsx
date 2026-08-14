const STEPS = [
  { n: 1, label: "Team" },
  { n: 2, label: "Institute" },
  { n: 3, label: "Project & Sector" },
];

export function StepIndicator({ current }: { current: number }) {
  // Cap the visual indicator at 3 steps maximum
  const visualStep = Math.min(3, current);

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {STEPS.map((step, i) => (
        <div key={step.n} className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-sm font-semibold transition ${
                step.n === visualStep
                  ? "bg-ink text-paper"
                  : step.n < visualStep
                  ? "bg-marigold text-ink"
                  : "border border-line bg-surface text-muted"
              }`}
            >
              {step.n < visualStep ? "✓" : step.n}
            </div>
            <span
              className={`hidden text-sm sm:inline ${
                step.n === visualStep ? "font-semibold text-ink" : "text-muted"
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`h-px w-4 sm:w-10 ${
                step.n < visualStep ? "bg-marigold" : "bg-line"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
