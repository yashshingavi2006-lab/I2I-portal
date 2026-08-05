export default function Loading() {
  return (
    <div className="theme-ember flex min-h-screen flex-1 items-center justify-center bg-paper">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-10 w-10">
          <span
            className="absolute inset-0 animate-spin rounded-full border-2 border-ember-line border-t-ember-accent"
            style={{ animationDuration: "0.8s" }}
          />
          <span
            className="absolute inset-0 m-auto h-1.5 w-1.5 rounded-full bg-ember-accent"
            style={{ boxShadow: "0 0 10px rgba(242,169,60,0.8)" }}
          />
        </div>
        <p className="text-xs font-medium uppercase tracking-widest text-ember-muted">
          Loading
        </p>
      </div>
    </div>
  );
}
