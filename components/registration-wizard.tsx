"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, CheckCircle2 } from "lucide-react";
import { Field, TextInput, TextArea, Select } from "./form-fields";
import { StepIndicator } from "./step-indicator";
import { RaiseQueryBox } from "./raise-query-box";
import {
  SECTORS,
  COLLEGE_TYPES,
  HEARD_ABOUT_OPTIONS,
  IDEA_STAGES,
  INDIAN_STATES,
  TEAM_SIZE_OPTIONS,
} from "@/lib/constants";

type Member = { full_name: string; email: string; phone: string; year_of_study: string };

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-line pb-3 last:border-0 last:pb-0 sm:grid-cols-[160px_1fr] sm:gap-3">
      <span className="text-xs font-medium uppercase tracking-wide text-muted">{label}</span>
      <span className="text-ink font-normal">{value || "—"}</span>
    </div>
  );
}

type FormData = {
  // Step 1: Team
  team_name: string;
  team_size: number;
  leader_name: string;
  leader_email: string;
  leader_phone: string;
  leader_whatsapp_optin: boolean;
  leader_gender: string;
  leader_dob: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  heard_about_us: string;
  members: Member[];
  // Step 2: Location
  state: string;
  city: string;
  college_name: string;
  college_type: string;
  faculty_contact_name: string;
  faculty_contact_phone: string;
  // Step 3: Sector, Project & Password
  sector_prefix: string;
  sub_theme: string;
  project_name: string;
  problem_statement: string;
  proposed_solution: string;
  target_beneficiaries: string;
  innovation_notes: string;
  idea_stage: string;
  leader_password: string;
  leader_password_confirm: string;
  consent_given: boolean;
};

const initialData: FormData = {
  team_name: "",
  team_size: 1,
  leader_name: "",
  leader_email: "",
  leader_phone: "",
  leader_whatsapp_optin: true,
  leader_gender: "",
  leader_dob: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  heard_about_us: "",
  members: [],
  state: "Maharashtra",
  city: "",
  college_name: "",
  college_type: "",
  faculty_contact_name: "",
  faculty_contact_phone: "",
  sector_prefix: "",
  sub_theme: "",
  project_name: "",
  problem_statement: "",
  proposed_solution: "",
  target_beneficiaries: "",
  innovation_notes: "",
  idea_stage: "",
  leader_password: "",
  leader_password_confirm: "",
  consent_given: false,
};

export function RegistrationWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(initialData);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [result, setResult] = useState<{ project_code: string; email_sent: boolean } | null>(null);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function syncMembers(size: number) {
    const extraCount = Math.max(0, size - 1);
    setData((d) => {
      const members = [...d.members];
      while (members.length < extraCount)
        members.push({ full_name: "", email: "", phone: "", year_of_study: "" });
      while (members.length > extraCount) members.pop();
      return { ...d, team_size: size, members };
    });
  }

  function stepError(s: number): string | null {
    if (s === 1) {
      if (!data.team_name.trim()) return "Team name is required.";
      if (!data.leader_name.trim()) return "Team leader's name is required.";
      if (!data.leader_email.trim() || !/^\S+@\S+\.\S+$/.test(data.leader_email))
        return "A valid leader email is required.";
      if (!data.leader_phone.trim() || data.leader_phone.replace(/\D/g, "").length < 10)
        return "A valid 10-digit leader phone number is required.";
      for (let i = 0; i < data.members.length; i++) {
        const m = data.members[i];
        if (!m.full_name.trim()) return `Member ${i + 2}'s name is required.`;
        if (!m.email.trim() || !/^\S+@\S+\.\S+$/.test(m.email))
          return `Member ${i + 2}'s email is required.`;
      }
    }
    if (s === 2) {
      if (!data.state.trim()) return "State is required.";
      if (!data.city.trim()) return "City is required.";
      if (!data.college_name.trim()) return "College name is required.";
    }
    if (s === 3) {
      if (!data.sector_prefix) return "Please select a sector.";
      if (!data.project_name.trim()) return "Project name is required.";
      if (!data.problem_statement.trim()) return "Problem statement is required.";
      if (!data.proposed_solution.trim()) return "Proposed solution is required.";
      if (!data.target_beneficiaries.trim()) return "Target beneficiaries is required.";
      if (!data.leader_password || data.leader_password.length < 8)
        return "Password must be at least 8 characters.";
      if (data.leader_password !== data.leader_password_confirm)
        return "Passwords don't match.";
      if (!data.consent_given)
        return "Please accept the declaration to complete registration.";
    }
    return null;
  }

  function next() {
    const err = stepError(step);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep((s) => Math.min(3, s + 1));
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  }

  async function submit() {
    for (const s of [1, 2, 3]) {
      const err = stepError(s);
      if (err) {
        setStep(s);
        setError(err);
        return;
      }
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      let json: { project_code?: string; error?: string; email_sent?: boolean } = {};
      try {
        json = await res.json();
      } catch {
        throw new Error(
          "Server didn't respond properly. Please try again or check with site admin."
        );
      }

      if (!res.ok) throw new Error(json.error || "Registration failed");
      setResult({ project_code: json.project_code!, email_sent: json.email_sent ?? false });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-lg rounded-2xl border border-line bg-surface p-8 text-center shadow-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 15 }}
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-marigold-light"
        >
          <span className="text-2xl">✓</span>
        </motion.div>

        <h2 className="font-display text-xl font-semibold text-ink">Registration confirmed</h2>

        <p className="mt-2 text-sm text-muted">Your project code is</p>
        <p className="mt-1 font-display text-2xl font-bold tracking-wide text-marigold">
          {result.project_code}
        </p>

        <p className="mt-4 text-sm leading-relaxed text-ink-light">
          You&apos;re all set — log in any time at{" "}
          <span className="font-medium text-ink">/login</span> with{" "}
          <span className="font-medium text-ink">{data.leader_email}</span> and your password.
        </p>

        {result.email_sent ? (
          <p className="mt-2 text-xs text-muted">
            We&apos;ve also sent a confirmation email with these details for your records.
          </p>
        ) : (
          <p className="mt-2 rounded-lg border border-marigold/25 bg-marigold/10 px-3 py-2 text-xs text-marigold">
            We couldn&apos;t send the confirmation email just now — save your login details above,
            you won&apos;t need the email to access your portal.
          </p>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
          <a href="/" className="text-sm font-medium text-muted hover:text-ink">
            ← Back to homepage
          </a>
          <a
            href="/login?portal=participant"
            className="rounded-lg bg-marigold px-4 py-2 text-sm font-semibold text-ink transition hover:brightness-95"
          >
            Log in to your portal →
          </a>
        </div>
      </motion.div>
      <RaiseQueryBox />
      </>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex justify-center">
        <StepIndicator current={step} />
      </div>

      <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8 shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="font-display text-lg font-semibold text-ink">
                  Team &amp; personal information
                </h2>
                <Field label="Team name" required>
                  <TextInput
                    value={data.team_name}
                    onChange={(e) => update("team_name", e.target.value)}
                    placeholder="e.g. Team Prakriti"
                  />
                </Field>
                <Field label="Team size" required hint="Between 1 and 3 members, including the team leader">
                  <Select
                    value={data.team_size}
                    onChange={(e) => syncMembers(Number(e.target.value))}
                  >
                    {TEAM_SIZE_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "member (solo)" : "members"}
                      </option>
                    ))}
                  </Select>
                </Field>

                <div className="border-t border-line pt-5">
                  <p className="mb-3 text-sm font-semibold text-ink">
                    Team leader — this account will log in to the portal
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full name" required>
                      <TextInput
                        value={data.leader_name}
                        onChange={(e) => update("leader_name", e.target.value)}
                      />
                    </Field>
                    <Field label="Email" required hint="Used for login and all notifications">
                      <TextInput
                        type="email"
                        value={data.leader_email}
                        onChange={(e) => update("leader_email", e.target.value)}
                      />
                    </Field>
                    <Field label="Phone number" required>
                      <TextInput
                        type="tel"
                        value={data.leader_phone}
                        onChange={(e) => update("leader_phone", e.target.value)}
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </Field>
                    <Field label="Gender">
                      <Select
                        value={data.leader_gender}
                        onChange={(e) => update("leader_gender", e.target.value)}
                      >
                        <option value="">Select</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                        <option>Prefer not to say</option>
                      </Select>
                    </Field>
                    <Field label="Date of birth">
                      <TextInput
                        type="date"
                        value={data.leader_dob}
                        onChange={(e) => update("leader_dob", e.target.value)}
                      />
                    </Field>
                    <Field label="How did you hear about I2I?">
                      <Select
                        value={data.heard_about_us}
                        onChange={(e) => update("heard_about_us", e.target.value)}
                      >
                        <option value="">Select</option>
                        {HEARD_ABOUT_OPTIONS.map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                  <label className="mt-3 flex items-center gap-2 text-sm text-muted">
                    <input
                      type="checkbox"
                      checked={data.leader_whatsapp_optin}
                      onChange={(e) => update("leader_whatsapp_optin", e.target.checked)}
                      className="h-4 w-4 rounded border-line accent-marigold"
                    />
                    Send updates to this number on WhatsApp
                  </label>
                </div>

                <div className="border-t border-line pt-5">
                  <p className="mb-3 text-sm font-semibold text-ink">Emergency contact</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Name">
                      <TextInput
                        value={data.emergency_contact_name}
                        onChange={(e) => update("emergency_contact_name", e.target.value)}
                      />
                    </Field>
                    <Field label="Phone">
                      <TextInput
                        type="tel"
                        value={data.emergency_contact_phone}
                        onChange={(e) => update("emergency_contact_phone", e.target.value)}
                      />
                    </Field>
                  </div>
                </div>

                {data.members.length > 0 && (
                  <div className="border-t border-line pt-5">
                    <p className="mb-3 text-sm font-semibold text-ink">
                      Other team members
                    </p>
                    <div className="space-y-4">
                      {data.members.map((m, i) => (
                        <div key={i} className="rounded-lg border border-line p-4">
                          <p className="mb-2 text-xs font-medium text-muted">
                            Member {i + 2}
                          </p>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <TextInput
                              placeholder="Full name *"
                              value={m.full_name}
                              onChange={(e) => {
                                const members = [...data.members];
                                members[i] = { ...m, full_name: e.target.value };
                                update("members", members);
                              }}
                            />
                            <TextInput
                              placeholder="Email *"
                              type="email"
                              value={m.email}
                              onChange={(e) => {
                                const members = [...data.members];
                                members[i] = { ...m, email: e.target.value };
                                update("members", members);
                              }}
                            />
                            <TextInput
                              placeholder="Phone"
                              value={m.phone}
                              onChange={(e) => {
                                const members = [...data.members];
                                members[i] = { ...m, phone: e.target.value };
                                update("members", members);
                              }}
                            />
                            <TextInput
                              placeholder="Year of study"
                              value={m.year_of_study}
                              onChange={(e) => {
                                const members = [...data.members];
                                members[i] = { ...m, year_of_study: e.target.value };
                                update("members", members);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-display text-lg font-semibold text-ink">
                  Institution &amp; location
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="State" required>
                    <Select value={data.state} onChange={(e) => update("state", e.target.value)}>
                      {INDIAN_STATES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="City" required>
                    <TextInput
                      value={data.city}
                      onChange={(e) => update("city", e.target.value)}
                    />
                  </Field>
                </div>
                <Field label="College name" required>
                  <TextInput
                    value={data.college_name}
                    onChange={(e) => update("college_name", e.target.value)}
                    placeholder="Start typing your college name"
                  />
                </Field>
                <Field label="College type">
                  <Select
                    value={data.college_type}
                    onChange={(e) => update("college_type", e.target.value)}
                  >
                    <option value="">Select</option>
                    {COLLEGE_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </Select>
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Faculty / point of contact name" hint="Optional">
                    <TextInput
                      value={data.faculty_contact_name}
                      onChange={(e) => update("faculty_contact_name", e.target.value)}
                    />
                  </Field>
                  <Field label="Faculty contact phone" hint="Optional">
                    <TextInput
                      value={data.faculty_contact_phone}
                      onChange={(e) => update("faculty_contact_phone", e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-lg font-semibold text-ink">
                    Project &amp; Sector details
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    Provide your project details and set up your portal login password below.
                  </p>
                </div>

                {/* Sector selection */}
                <div className="space-y-4 rounded-xl border border-line bg-paper p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-marigold">
                    1. Sector Selection
                  </h3>
                  <Field
                    label="Which sector is your project in?"
                    required
                    hint="This determines your project code prefix"
                  >
                    <Select
                      value={data.sector_prefix}
                      onChange={(e) => update("sector_prefix", e.target.value)}
                    >
                      <option value="">Select a sector</option>
                      {SECTORS.map((s) => (
                        <option key={s.prefix} value={s.prefix}>
                          {s.label} ({s.prefix})
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Sub-theme or focus area" hint="Optional — helps with mentor matching later">
                    <TextInput
                      value={data.sub_theme}
                      onChange={(e) => update("sub_theme", e.target.value)}
                      placeholder="e.g. Waste management, Water conservation"
                    />
                  </Field>
                </div>

                {/* Project Details */}
                <div className="space-y-4 rounded-xl border border-line bg-paper p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-marigold">
                    2. Project Details
                  </h3>
                  <Field label="Project name" required>
                    <TextInput
                      value={data.project_name}
                      onChange={(e) => update("project_name", e.target.value)}
                    />
                  </Field>
                  <Field label="Problem statement" required hint="What problem are you solving? (~150 words)">
                    <TextArea
                      value={data.problem_statement}
                      onChange={(e) => update("problem_statement", e.target.value)}
                    />
                  </Field>
                  <Field label="Proposed solution" required hint="~300 words">
                    <TextArea
                      value={data.proposed_solution}
                      onChange={(e) => update("proposed_solution", e.target.value)}
                    />
                  </Field>
                  <Field label="Target beneficiaries" required>
                    <TextArea
                      value={data.target_beneficiaries}
                      onChange={(e) => update("target_beneficiaries", e.target.value)}
                    />
                  </Field>
                  <Field label="What makes your approach unique?" hint="Optional">
                    <TextArea
                      value={data.innovation_notes}
                      onChange={(e) => update("innovation_notes", e.target.value)}
                    />
                  </Field>
                  <Field label="Current stage of your idea">
                    <Select
                      value={data.idea_stage}
                      onChange={(e) => update("idea_stage", e.target.value)}
                    >
                      <option value="">Select</option>
                      {IDEA_STAGES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </Select>
                  </Field>
                </div>

                {/* Password Setup */}
                <div className="space-y-4 rounded-xl border border-line bg-paper p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-marigold">
                    3. Set Portal Password
                  </h3>
                  <p className="text-xs text-muted">
                    This password will be used by {data.leader_email || "the team leader"} to log into the I2I portal.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Password" required hint="At least 8 characters">
                      <TextInput
                        type="password"
                        value={data.leader_password}
                        onChange={(e) => update("leader_password", e.target.value)}
                        autoComplete="new-password"
                      />
                    </Field>
                    <Field label="Confirm password" required>
                      <TextInput
                        type="password"
                        value={data.leader_password_confirm}
                        onChange={(e) => update("leader_password_confirm", e.target.value)}
                        autoComplete="new-password"
                      />
                    </Field>
                  </div>
                </div>

                {/* Declaration Checkbox */}
                <div className="rounded-xl border border-line bg-paper p-4">
                  <label className="flex items-start gap-2.5 text-sm text-ink-light">
                    <input
                      type="checkbox"
                      checked={data.consent_given}
                      onChange={(e) => update("consent_given", e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-line accent-marigold"
                    />
                    <span>
                      I confirm the information provided is accurate, and I agree to the
                      I2I terms and data privacy policy.
                    </span>
                  </label>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {error && (
          <p className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
          <button
            onClick={back}
            disabled={step === 1}
            className="rounded-lg px-4 py-2 text-sm font-medium text-muted transition hover:text-ink disabled:opacity-0"
          >
            Back
          </button>

          <div className="flex items-center gap-3">
            {step === 3 && (
              <button
                type="button"
                onClick={() => setShowReviewModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper px-3.5 py-2 text-xs font-semibold text-ink transition hover:bg-surface hover:border-ink/30"
              >
                <Eye className="size-3.5 text-marigold" />
                Review Details
              </button>
            )}

            {step < 3 ? (
              <button
                onClick={next}
                className="rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-ink-light"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={submitting}
                className="rounded-lg bg-marigold px-5 py-2.5 text-sm font-semibold text-ink transition hover:brightness-95 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Complete registration"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Review Details Pop-up Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReviewModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-line bg-surface shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <div className="flex items-center gap-2">
                  <Eye className="size-4 text-marigold" />
                  <h3 className="font-display text-base font-semibold text-ink">
                    Review your registration details
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="rounded-lg p-1 text-muted transition hover:bg-paper hover:text-ink"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto p-6 text-sm">
                <p className="text-xs text-muted">
                  Check your entered information below before completing your registration.
                </p>

                <div className="space-y-3 rounded-xl border border-line bg-paper p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-marigold">
                    Team &amp; Leader
                  </p>
                  <PreviewRow label="Team name" value={data.team_name} />
                  <PreviewRow label="Team size" value={String(data.team_size)} />
                  <PreviewRow
                    label="Team leader"
                    value={`${data.leader_name} · ${data.leader_email} · ${data.leader_phone}`}
                  />
                  {data.members.map((m, i) => (
                    <PreviewRow
                      key={i}
                      label={`Member ${i + 2}`}
                      value={`${m.full_name} · ${m.email} · ${m.phone || "—"}`}
                    />
                  ))}
                </div>

                <div className="space-y-3 rounded-xl border border-line bg-paper p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-marigold">
                    Institute &amp; Location
                  </p>
                  <PreviewRow
                    label="College"
                    value={`${data.college_name || "—"}, ${data.city || "—"}, ${data.state || "—"}`}
                  />
                  <PreviewRow label="College type" value={data.college_type} />
                  <PreviewRow label="Faculty POC" value={data.faculty_contact_name} />
                </div>

                <div className="space-y-3 rounded-xl border border-line bg-paper p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-marigold">
                    Project &amp; Sector
                  </p>
                  <PreviewRow
                    label="Sector"
                    value={SECTORS.find((s) => s.prefix === data.sector_prefix)?.label || "—"}
                  />
                  <PreviewRow label="Sub-theme" value={data.sub_theme} />
                  <PreviewRow label="Project name" value={data.project_name} />
                  <PreviewRow label="Problem statement" value={data.problem_statement} />
                  <PreviewRow label="Proposed solution" value={data.proposed_solution} />
                  <PreviewRow label="Beneficiaries" value={data.target_beneficiaries} />
                  <PreviewRow label="Idea stage" value={data.idea_stage} />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-line px-6 py-4">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="rounded-lg border border-line px-4 py-2 text-xs font-medium text-muted transition hover:bg-paper hover:text-ink"
                >
                  Edit details
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-xs font-semibold text-paper transition hover:bg-ink-light"
                >
                  <CheckCircle2 className="size-3.5 text-marigold" />
                  Looks good!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <RaiseQueryBox />
    </div>
  );
}
