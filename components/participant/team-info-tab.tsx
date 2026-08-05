"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Member = { full_name: string; email: string | null; phone: string | null; role: string | null };

type TeamData = {
  id: string;
  project_code: string | null;
  leader_name: string;
  leader_email: string;
  leader_phone: string;
  college_name: string;
  department: string | null;
  city: string;
  district: string | null;
  division: string | null;
  state: string;
  project_name: string;
  problem_statement: string;
  sector_label: string;
  members: Member[];
};

export function TeamInfoTab({ team }: { team: TeamData }) {
  const [showEditRequest, setShowEditRequest] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function submitEditRequest() {
    if (!reason.trim()) return;
    setSubmitting(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("edit_requests").insert({
      team_id: team.id,
      requested_by: user.id,
      section: "team_info",
      reason: reason.trim(),
    });
    setSubmitting(false);
    if (!error) {
      setSubmitted(true);
      setShowEditRequest(false);
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Team Profile Details</h2>
          <p className="mt-1 text-sm text-muted">Below are your registered competition parameters.</p>
        </div>
        <button
          onClick={() => setShowEditRequest(true)}
          className="rounded-lg bg-marigold px-4 py-2 text-sm font-semibold text-ink"
        >
          Raise Edit Request
        </button>
      </div>

      {submitted && (
        <div className="mt-4 rounded-lg border border-marigold/30 bg-marigold/10 px-4 py-3 text-sm text-marigold">
          Your edit request has been sent to the Secretary for review.
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Team & Member Roster
          </p>
          <div className="mt-3 space-y-1 text-sm">
            <p className="text-marigold font-display font-semibold">
              Project ID: {team.project_code ?? "Pending"}
            </p>
            <p className="text-ink">Team Leader: {team.leader_name}</p>
            <p className="text-muted">Leader Email: {team.leader_email}</p>
            <p className="text-muted">Leader Contact: {team.leader_phone}</p>
          </div>
          {team.members.map((m, i) => (
            <div key={i} className="mt-4 border-t border-line pt-3 text-sm">
              <p className="font-medium text-ink">Team Member #{i + 1}</p>
              <p className="text-muted">Name: {m.full_name}</p>
              {m.email && <p className="text-muted">Email: {m.email}</p>}
              {m.phone && <p className="text-muted">Contact: {m.phone}</p>}
              {m.role && <p className="text-muted">Role: {m.role}</p>}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Institute Specification
          </p>
          <div className="mt-3 space-y-1 text-sm">
            <p className="text-ink">Institute Name: {team.college_name}</p>
            {team.department && <p className="text-muted">Department: {team.department}</p>}
            <p className="text-muted">City: {team.city}</p>
            {team.district && <p className="text-muted">District: {team.district}</p>}
            {team.division && <p className="text-muted">Division: {team.division}</p>}
            <p className="text-muted">State: {team.state}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Project Details</p>
        <div className="mt-3 space-y-2 text-sm">
          <p className="text-ink">Sector: {team.sector_label}</p>
          <p className="text-ink">Project Title: {team.project_name}</p>
          <div>
            <p className="text-muted">Description/Problem Statement:</p>
            <p className="mt-1 rounded-lg border border-line bg-paper p-3 text-ink">
              {team.problem_statement}
            </p>
          </div>
        </div>
      </div>

      {showEditRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6">
            <h3 className="font-display text-lg font-bold text-ink">Raise Edit Request</h3>
            <p className="mt-1 text-sm text-muted">
              Tell the Secretary what needs to change and why. They'll review and unlock the
              relevant field.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="e.g. My phone number changed, please update it to..."
              className="mt-3 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowEditRequest(false)}
                className="rounded-lg border border-line px-4 py-2 text-sm text-ink-light"
              >
                Cancel
              </button>
              <button
                onClick={submitEditRequest}
                disabled={submitting || !reason.trim()}
                className="rounded-lg bg-marigold px-4 py-2 text-sm font-semibold text-ink disabled:opacity-60"
              >
                {submitting ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
