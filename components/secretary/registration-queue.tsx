"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { SECTORS } from "@/lib/constants";

type TeamRow = {
  id: string;
  project_code: string | null;
  project_name: string;
  team_name: string;
  college_name: string;
  leader_email: string;
  status: string;
  sectors: { display_name: string } | null;
};

const TABS = [
  { key: "all", label: "All Registrations" },
  { key: "pending", label: "Pending / Unverified" },
  { key: "eligible", label: "Eligible" },
  { key: "rejected", label: "Rejected" },
] as const;

function statusToTab(status: string) {
  if (status === "rejected" || status === "withdrawn") return "rejected";
  if (status === "registered" || status === "under_review") return "pending";
  return "eligible"; // shortlisted_phase2 and beyond counts as "eligible" out of phase 1
}

export function RegistrationQueue() {
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [bulkRunning, setBulkRunning] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("teams")
      .select(
        "id, project_code, project_name, team_name, college_name, leader_email, status, sectors(display_name)"
      )
      .order("created_at", { ascending: false });
    if (!error && data) setTeams(data as unknown as TeamRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function makeAllEligible() {
    if (!confirm("Mark every pending registration as eligible for Phase 2? This will trigger notification emails to all of them.")) {
      return;
    }
    setBulkRunning(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("make_all_phase1_eligible");
    setBulkRunning(false);
    if (error) {
      alert("Failed: " + error.message);
      return;
    }
    load();
  }

  async function setStatus(teamId: string, status: string) {
    setActioningId(teamId);
    const supabase = createClient();
    const { error } = await supabase.from("teams").update({ status }).eq("id", teamId);
    setActioningId(null);
    if (error) {
      alert("Failed: " + error.message);
      return;
    }
    setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, status } : t)));
  }

  const filtered = teams.filter((t) => {
    if (tab !== "all" && statusToTab(t.status) !== tab) return false;
    if (sectorFilter !== "all" && t.sectors?.display_name !== sectorFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !t.project_name.toLowerCase().includes(q) &&
        !t.team_name.toLowerCase().includes(q) &&
        !t.college_name.toLowerCase().includes(q) &&
        !(t.project_code ?? "").toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const counts = {
    all: teams.length,
    pending: teams.filter((t) => statusToTab(t.status) === "pending").length,
    eligible: teams.filter((t) => statusToTab(t.status) === "eligible").length,
    rejected: teams.filter((t) => statusToTab(t.status) === "rejected").length,
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Phase 1 – Registration Queue
          </h1>
          <p className="mt-1 text-sm text-muted">
            Review all registered team entries. Shortlist eligible candidates to unlock Phase 2.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-marigold"
          />
          <button
            onClick={makeAllEligible}
            disabled={bulkRunning}
            className="whitespace-nowrap rounded-lg bg-marigold px-4 py-2 text-sm font-semibold text-ink disabled:opacity-60"
          >
            {bulkRunning ? "Working..." : "⚡ Make All Phase 1 Eligible"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              tab === t.key
                ? "border-marigold text-marigold"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label} ({counts[t.key]})
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-4 flex gap-3">
        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
        >
          <option value="all">All Sectors</option>
          {SECTORS.map((s) => (
            <option key={s.prefix} value={s.label}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Project Code</th>
              <th className="px-4 py-3 font-medium">Project Title</th>
              <th className="px-4 py-3 font-medium">Sector</th>
              <th className="px-4 py-3 font-medium">College</th>
              <th className="px-4 py-3 font-medium">Team Leader</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted">
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted">
                  No registrations match this view.
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-display font-semibold text-marigold">
                    {t.project_code ?? "Pending"}
                  </td>
                  <td className="px-4 py-3 text-ink">{t.project_name}</td>
                  <td className="px-4 py-3 text-muted">{t.sectors?.display_name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{t.college_name}</td>
                  <td className="px-4 py-3 text-muted">{t.leader_email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-line bg-paper px-2.5 py-1 text-xs capitalize text-ink-light">
                      {t.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setStatus(t.id, "shortlisted_phase2")}
                        disabled={actioningId === t.id}
                        className="rounded-lg bg-green-500/15 px-2.5 py-1.5 text-xs font-medium text-green-400 disabled:opacity-50"
                      >
                        Eligible
                      </button>
                      <button
                        onClick={() => setStatus(t.id, "rejected")}
                        disabled={actioningId === t.id}
                        className="rounded-lg bg-red-500/15 px-2.5 py-1.5 text-xs font-medium text-red-400 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
