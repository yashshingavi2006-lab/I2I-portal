"use client";

import { useEffect, useState, useCallback } from "react";
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
    // Open the current week by default so there's less to hunt for.
    setOpenWeek((prev) => prev ?? currentWeekNumber());
  }, [load]);

  async function save(week: number, text: string) {
    const supabase = createClient();
    await supabase
      .from("weekly_targets")
      .upsert({ team_id: teamId, week_number: week, target_text: text }, { onConflict: "team_id,week_number" });
    setTargets((prev) => ({ ...prev, [week]: text }));
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <h3 className="font-display text-base font-semibold text-ink">Weekly Development Targets</h3>
      <p className="text-xs text-muted">
        {readOnly
          ? "The team's stated plan for each week, alongside the calendar dates it covers."
          : "8 weeks, December through January. Click a week to open it, write your plan, and save."}
      </p>
      <div className="mt-5 space-y-3">
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
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  useEffect(() => setValue(text), [text]);

  const days = datesForWeek(start);
  const dirty = value !== text;
  const hasContent = text.trim().length > 0;

  async function handleSave() {
    setSaving(true);
    await onSave(value);
    setSaving(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-colors ${
        isCurrent ? "border-marigold/50" : "border-line"
      } ${isOpen ? "bg-paper" : "bg-paper/40"}`}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex shrink-0 flex-col items-start">
            <span className="font-display text-base font-semibold text-ink">Week {week}</span>
            <span className="text-xs text-muted">{formatRange(start, end)}</span>
          </div>
          {isCurrent && (
            <span className="shrink-0 rounded-full bg-marigold px-2 py-0.5 text-[10px] font-semibold uppercase text-ink">
              Current
            </span>
          )}
          {!isOpen && (
            <span className="min-w-0 truncate text-sm text-muted">
              {hasContent ? text : readOnly ? "No target set for this week." : "Click to add a plan"}
            </span>
          )}
        </div>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`shrink-0 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-line px-5 py-5">
          <div className="flex gap-1.5">
            {days.map((d, i) => (
              <div
                key={i}
                className="flex w-10 flex-col items-center rounded-lg border border-line bg-surface py-1.5 text-xs"
              >
                <span className="text-muted">{d.label}</span>
                <span className="font-medium text-ink-light">{d.day}</span>
              </div>
            ))}
          </div>

          {readOnly ? (
            <p className="mt-4 text-sm text-ink">
              {hasContent ? text : <span className="text-muted">No target set for this week.</span>}
            </p>
          ) : (
            <>
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="What do you plan to get done this week?"
                rows={4}
                className="mt-4 w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-marigold"
              />
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={!dirty || saving}
                  className="rounded-lg bg-marigold px-4 py-2 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
                {justSaved && !dirty && (
                  <span className="text-xs font-medium text-green-500">✓ Saved</span>
                )}
                {dirty && !saving && <span className="text-xs text-muted">Unsaved changes</span>}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
