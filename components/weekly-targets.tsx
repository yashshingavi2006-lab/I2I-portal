"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { WEEKLY_TARGET_WEEKS } from "@/lib/constants";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const easeOut = [0.16, 1, 0.3, 1] as const;

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

  async function save(week: number, text: string) {
    setTargets((prev) => ({ ...prev, [week]: text }));
    const supabase = createClient();
    await supabase
      .from("weekly_targets")
      .upsert({ team_id: teamId, week_number: week, target_text: text }, { onConflict: "team_id,week_number" });
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <h3 className="font-display text-base font-semibold text-ink">Weekly Development Targets</h3>
      <p className="text-xs text-muted">
        {readOnly
          ? "The team's stated plan for each week, alongside the calendar dates it covers."
          : "8 weeks, December through January. Click a week to open it, fill in your plan, and save — the dates are shown for reference only."}
      </p>
      <div className="mt-5 flex flex-col gap-3">
        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : (
          WEEKLY_TARGET_WEEKS.map((w) => (
            <WeekAccordionItem
              key={w.week}
              week={w.week}
              start={w.start}
              end={w.end}
              isCurrent={w.week === nowWeek}
              isOpen={openWeek === w.week}
              onToggle={() => setOpenWeek((prev) => (prev === w.week ? null : w.week))}
              text={targets[w.week] ?? ""}
              readOnly={readOnly || !!locked}
              onSave={(text) => save(w.week, text)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function WeekAccordionItem({
  week,
  start,
  end,
  isCurrent,
  isOpen,
  onToggle,
  text,
  readOnly,
  onSave,
}: {
  week: number;
  start: string;
  end: string;
  isCurrent: boolean;
  isOpen: boolean;
  onToggle: () => void;
  text: string;
  readOnly: boolean;
  onSave: (text: string) => void;
}) {
  const [value, setValue] = useState(text);
  const [justSaved, setJustSaved] = useState(false);
  useEffect(() => setValue(text), [text]);
  const days = datesForWeek(start);
  const dirty = value !== text;

  function handleSave() {
    onSave(value);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
        isCurrent ? "border-marigold bg-marigold/5" : "border-line bg-paper"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-ink/[0.02]"
      >
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="flex shrink-0 flex-col">
            <span className="text-sm font-semibold text-ink">Week {week}</span>
            <span className="text-xs text-muted">{formatRange(start, end)}</span>
          </div>
          {isCurrent && (
            <span className="shrink-0 rounded-full bg-marigold px-2 py-0.5 text-[10px] font-semibold uppercase text-ink">
              Current
            </span>
          )}
          {!isOpen && (
            <p className="min-w-0 flex-1 truncate text-sm text-muted">
              {text.trim() ? text : <span className="italic">No target set for this week.</span>}
            </p>
          )}
        </div>
        <ChevronDown
          className={`size-4 shrink-0 text-muted transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: easeOut }}
          >
            <div className="flex flex-col gap-4 border-t border-line p-5 pt-4">
              <div className="flex gap-1.5">
                {days.map((d, i) => (
                  <div
                    key={i}
                    className="flex flex-1 flex-col items-center rounded-lg border border-line bg-surface py-2 text-xs text-muted"
                  >
                    <span>{d.label}</span>
                    <span className="mt-0.5 font-medium text-ink-light">{d.day}</span>
                  </div>
                ))}
              </div>

              {readOnly ? (
                <p className="text-sm leading-relaxed text-ink">
                  {text.trim() ? text : <span className="text-muted">No target set for this week.</span>}
                </p>
              ) : (
                <>
                  <textarea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="What do you plan to get done this week?"
                    rows={4}
                    className="resize-none rounded-xl border border-line bg-transparent px-4 py-3 text-sm leading-relaxed text-ink outline-none focus:border-marigold"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={!dirty}
                      className="rounded-full bg-marigold px-4 py-2 text-xs font-semibold text-ink transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Save changes
                    </button>
                    {justSaved && (
                      <span className="flex items-center gap-1 text-xs text-marigold">
                        <Check className="size-3.5" /> Saved
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={onToggle}
                      className="ml-auto text-xs text-muted transition-colors hover:text-ink"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
