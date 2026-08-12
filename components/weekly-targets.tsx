"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { X, Check, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { WEEKLY_TARGET_WEEKS } from "@/lib/constants";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function datesForWeek(startISO: string): { day: number; label: string }[] {
  const start = new Date(startISO + "T00:00:00Z");
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    return { day: d.getUTCDate(), label: DAY_LABELS[d.getUTCDay()] };
  });
}

function formatRange(startISO: string, endISO: string): string {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", timeZone: "UTC" };
  const start = new Date(startISO + "T00:00:00Z").toLocaleDateString("en-US", opts);
  const end = new Date(endISO + "T00:00:00Z").toLocaleDateString("en-US", opts);
  return `${start} – ${end}`;
}

function currentWeekNumber(): number | null {
  const today = new Date().toISOString().slice(0, 10);
  return WEEKLY_TARGET_WEEKS.find((w) => today >= w.start && today <= w.end)?.week ?? null;
}

export function WeeklyTargets({
  teamId,
  readOnly,
  locked,
}: {
  teamId: string;
  readOnly: boolean;
  locked?: boolean;
}) {
  const [targets, setTargets] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [openWeek, setOpenWeek] = useState<number | null>(null);
  const nowWeek = currentWeekNumber();

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("weekly_targets")
      .select("week_number, target_text")
      .eq("team_id", teamId);
    const map: Record<number, string> = {};
    for (const row of data ?? []) {
      map[row.week_number] = row.target_text ?? "";
    }
    setTargets(map);
    setLoading(false);
  }, [teamId]);

  useEffect(() => {
    load();
  }, [load]);

  // Close on Escape, wherever focus happens to be.
  useEffect(() => {
    if (openWeek === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenWeek(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openWeek]);

  async function save(week: number, text: string) {
    setTargets((prev) => ({ ...prev, [week]: text }));
    const supabase = createClient();
    await supabase
      .from("weekly_targets")
      .upsert({ team_id: teamId, week_number: week, target_text: text }, { onConflict: "team_id,week_number" });
  }

  const active = WEEKLY_TARGET_WEEKS.find((w) => w.week === openWeek);

  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <h3 className="font-display text-base font-semibold text-ink">Weekly Development Targets</h3>
      <p className="text-xs text-muted">
        {readOnly
          ? "The team's stated plan for each week, alongside the calendar dates it covers."
          : "8 weeks, December through January. Click a week to open it and fill in your plan — the dates are shown for reference only."}
      </p>
      <div className="mt-4 flex flex-col gap-2">
        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : (
          WEEKLY_TARGET_WEEKS.map((w) => (
            <WeekRow
              key={w.week}
              week={w.week}
              start={w.start}
              end={w.end}
              isCurrent={w.week === nowWeek}
              text={targets[w.week] ?? ""}
              onOpen={() => setOpenWeek(w.week)}
            />
          ))
        )}
      </div>

      {active && (
        <WeekModal
          week={active.week}
          start={active.start}
          end={active.end}
          isCurrent={active.week === nowWeek}
          text={targets[active.week] ?? ""}
          readOnly={readOnly || !!locked}
          onSave={(text) => save(active.week, text)}
          onClose={() => setOpenWeek(null)}
        />
      )}
    </div>
  );
}

function WeekRow({
  week,
  start,
  end,
  isCurrent,
  text,
  onOpen,
}: {
  week: number;
  start: string;
  end: string;
  isCurrent: boolean;
  text: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`flex w-full items-center gap-4 rounded-xl border px-4 py-3 text-left transition-colors ${
        isCurrent ? "border-marigold bg-marigold/5" : "border-line bg-paper hover:bg-ink/[0.02]"
      }`}
    >
      <div className="flex shrink-0 flex-col">
        <span className="text-sm font-semibold text-ink">Week {week}</span>
        <span className="text-xs text-muted">{formatRange(start, end)}</span>
      </div>
      {isCurrent && (
        <span className="shrink-0 rounded-full bg-marigold px-2 py-0.5 text-[10px] font-semibold uppercase text-ink">
          Current
        </span>
      )}
      <p className="min-w-0 flex-1 truncate text-sm text-muted">
        {text.trim() ? text : <span className="italic">No target set for this week.</span>}
      </p>
      <ChevronRight className="size-4 shrink-0 text-muted" />
    </button>
  );
}

function WeekModal({
  week,
  start,
  end,
  isCurrent,
  text,
  readOnly,
  onSave,
  onClose,
}: {
  week: number;
  start: string;
  end: string;
  isCurrent: boolean;
  text: string;
  readOnly: boolean;
  onSave: (text: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(text);
  const [justSaved, setJustSaved] = useState(false);
  const days = datesForWeek(start);
  const dirty = value !== text;

  function handleSave() {
    onSave(value);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-line bg-surface"
      >
        <div className="flex items-center justify-between border-b border-line p-6">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="font-display text-lg font-bold text-ink">Week {week}</h3>
              <p className="text-xs text-muted">{formatRange(start, end)}</p>
            </div>
            {isCurrent && (
              <span className="rounded-full bg-marigold px-2.5 py-1 text-[10px] font-semibold uppercase text-ink">
                Current
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-6">
          <div className="flex gap-2">
            {days.map((d, i) => (
              <div
                key={i}
                className="flex flex-1 flex-col items-center rounded-lg border border-line bg-paper py-2.5 text-xs text-muted"
              >
                <span>{d.label}</span>
                <span className="mt-0.5 font-medium text-ink-light">{d.day}</span>
              </div>
            ))}
          </div>

          {readOnly ? (
            <p className="flex-1 whitespace-pre-wrap text-sm leading-relaxed text-ink">
              {text.trim() ? text : <span className="text-muted">No target set for this week.</span>}
            </p>
          ) : (
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="What do you plan to get done this week?"
              className="flex-1 resize-none rounded-xl border border-line bg-transparent px-4 py-3 text-sm leading-relaxed text-ink outline-none focus:border-marigold"
              autoFocus
            />
          )}
        </div>

        {!readOnly && (
          <div className="flex items-center gap-3 border-t border-line p-6">
            <button
              type="button"
              onClick={handleSave}
              disabled={!dirty}
              className="rounded-full bg-marigold px-5 py-2.5 text-sm font-semibold text-ink transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save changes
            </button>
            {justSaved && (
              <span className="flex items-center gap-1 text-sm text-marigold">
                <Check className="size-4" /> Saved
              </span>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
