"use client";

import { useState } from "react";

type Staff = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  head_title: string | null;
  is_active: boolean;
};

const ROLES = [
  { value: "secretary", label: "Secretary" },
  { value: "chief_ambassador", label: "Chief Ambassador" },
  { value: "ambassador", label: "Ambassador" },
  { value: "mentor", label: "Mentor" },
  { value: "head", label: "Head" },
];

export function UsersAccessPanel({ initialStaff }: { initialStaff: Staff[] }) {
  const [staff, setStaff] = useState(initialStaff);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("ambassador");
  const [headTitle, setHeadTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function invite() {
    setError(null);
    setSuccess(null);
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/staff/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: name, email, role, head_title: headTitle }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Invite failed");
      setStaff((prev) => [
        ...prev,
        { id: crypto.randomUUID(), full_name: name, email, role, head_title: headTitle || null, is_active: true },
      ]);
      setSuccess(`Invited ${name} — they'll get an email to set their password.`);
      setName("");
      setEmail("");
      setHeadTitle("");
      setShowForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-marigold">
            Management
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink">Users &amp; Access</h1>
          <p className="mt-1 text-sm text-muted">
            Invite and manage Secretary, Chief Ambassador, Ambassador, Mentor, and Head accounts.
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="whitespace-nowrap rounded-lg bg-marigold px-4 py-2.5 text-sm font-semibold text-ink"
        >
          {showForm ? "Cancel" : "+ Invite staff"}
        </button>
      </div>

      {showForm && (
        <div className="mt-4 rounded-2xl border border-line bg-surface p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            {role === "head" && (
              <input
                value={headTitle}
                onChange={(e) => setHeadTitle(e.target.value)}
                placeholder="Head title (e.g. Web Dev Head)"
                className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink"
              />
            )}
          </div>
          {error && (
            <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </p>
          )}
          <button
            onClick={invite}
            disabled={saving}
            className="mt-4 rounded-lg bg-marigold px-4 py-2 text-sm font-semibold text-ink disabled:opacity-60"
          >
            {saving ? "Inviting..." : "Send invite"}
          </button>
        </div>
      )}

      {success && (
        <p className="mt-4 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-sm text-green-400">
          {success}
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-paper text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted">
                  No staff accounts yet.
                </td>
              </tr>
            ) : (
              staff.map((s) => (
                <tr key={s.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-ink">{s.full_name}</td>
                  <td className="px-4 py-3 text-muted">{s.email}</td>
                  <td className="px-4 py-3 capitalize text-ink-light">
                    {s.head_title || s.role.replace("_", " ")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        s.is_active
                          ? "bg-green-500/15 text-green-400"
                          : "bg-red-500/15 text-red-400"
                      }`}
                    >
                      {s.is_active ? "Active" : "Inactive"}
                    </span>
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
