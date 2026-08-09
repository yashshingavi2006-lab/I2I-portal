"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type Person = { key: string; name: string; who: string };

export function RejectedPanel({ teamId }: { teamId: string }) {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const supabase = createClient();
    const [{ data: team }, { data: members }] = await Promise.all([
      supabase.from("teams").select("leader_name").eq("id", teamId).single(),
      supabase.from("team_members").select("id, full_name").eq("team_id", teamId),
    ]);
    const list: Person[] = [];
    if (team) list.push({ key: "leader", name: team.leader_name, who: "leader" });
    for (const m of members ?? []) {
      list.push({ key: m.id, name: m.full_name, who: m.id });
    }
    setPeople(list);
    setLoading(false);
  }, [teamId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface p-8">
      <p className="font-display text-lg font-semibold text-ink">Thank you for participating</p>
      <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
        Your team was not shortlisted to continue in I2I 2026-27. Thank you for putting your idea
        forward — you can download your participation certificate below.
      </p>

      <div className="mt-5 space-y-2">
        {loading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : (
          people.map((p) => (
            <div
              key={p.key}
              className="flex items-center justify-between rounded-lg border border-line bg-paper px-4 py-3"
            >
              <span className="text-sm font-medium text-ink">{p.name}</span>
              <a
                href={`/api/participant/certificate?who=${encodeURIComponent(p.who)}`}
                className="rounded-lg bg-marigold px-3 py-1.5 text-xs font-semibold text-ink"
              >
                Download Certificate
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
