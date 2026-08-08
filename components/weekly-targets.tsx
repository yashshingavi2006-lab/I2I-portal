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
          : "8 weeks, December through January. Fill in what you plan to get done each week — the dates are shown for reference only."}
      </p>
      <div className="mt-4 space-y-2">
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
              readOnly={readOnly || !!locked}
              onSave={(text) => save(w.week, text)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function WeekRow({
  week,
  start,
  end,
  isCurrent,
  text,
  readOnly,
  onSave,
}: {
  week: number;
  start: string;
  end: string;
  isCurrent: boolean;
  text: string;
  readOnly: boolean;
  onSave: (text: string) => void;
}) {
  const [value, setValue] = useState(text);
  useEffect(() => setValue(text), [text]);
  const days = datesForWeek(start);

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center ${
        isCurrent ? "border-marigold bg-marigold/5" : "border-line bg-paper"
      }`}
    >
      <div className="flex shrink-0 items-center gap-2 sm:w-60">
        <div className="flex w-14 flex-col">
          <span className="text-xs font-semibold text-ink">Week {week}</span>
          <span className="text-[10px] text-muted">{formatRange(start, end)}</span>
          {isCurrent && (
            <span className="mt-1 w-fit rounded-full bg-marigold px-1.5 py-0.5 text-[9px] font-semibold uppercase text-ink">
              Current
            </span>
          )}
        </div>
        <div className="flex gap-0.5">
          {days.map((d, i) => (
            <div key={i} className="flex w-6 flex-col items-center rounded-md py-0.5 text-[10px] text-muted">
              <span>{d.label}</span>
              <span className="font-medium text-ink-light">{d.day}</span>
            </div>
          ))}
        </div>
      </div>
      {readOnly ? (
        <p className="flex-1 text-sm text-ink">
          {text.trim() ? text : <span className="text-muted">No target set for this week.</span>}
        </p>
      ) : (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => value !== text && onSave(value)}
          placeholder="What do you plan to get done this week?"
          className="flex-1 rounded-lg border border-line bg-transparent px-3 py-1.5 text-sm text-ink outline-none focus:border-marigold"
        />
      )}
    </div>
  );
}
