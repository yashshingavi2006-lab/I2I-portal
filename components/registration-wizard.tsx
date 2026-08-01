"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Field, TextInput, TextArea, Select } from "./form-fields";
import { StepIndicator } from "./step-indicator";
import {
  SECTORS,
  COLLEGE_TYPES,
  HEARD_ABOUT_OPTIONS,
  IDEA_STAGES,
  INDIAN_STATES,
  TEAM_SIZE_OPTIONS,
} from "@/lib/constants";

type Member = { full_name: string; email: string; phone: string; year_of_study: string };

type FormData = {
  // Page 1
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
  // Page 2
  state: string;
  city: string;
  college_name: string;
  college_type: string;
  faculty_contact_name: string;
  faculty_contact_phone: string;
  // Page 3
  sector_prefix: string;
  sub_theme: string;
  // Page 4
  project_name: string;
  problem_statement: string;
  proposed_solution: string;
  target_beneficiaries: string;
  innovation_notes: string;
  idea_stage: string;
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
  consent_given: false,
};

export function RegistrationWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(initialData);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ project_code: string } | null>(null);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function syncMembers(size: number) {
    const extraCount = Math.max(0, size - 1); // members beyond the leader
    setData((d) => {
      const members = [...d.members];
      while (members.length < extraCount)
        members.push({ full_name: "", email: "", phone: "", year_of_study: "" });
      while (members.length > extraCount) members.pop();
      return { ...d, team_size: size, members };
    });
  }

  function next() {
    setError(null);
    setStep((s) => Math.min(4, s + 1));
  }
  function back() {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  }

  async function submit() {
    if (!data.consent_given) {
      setError("Please accept the declaration to submit your registration.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      let json: { project_code?: string; error?: string } = {};
      try {
        json = await res.json();
      } catch {
        // Response wasn't valid JSON at all (e.g. server crashed before
        // responding, or a proxy/dev-server error page came back instead).
        throw new Error(
          "Server didn't respond properly. This usually means the backend isn't set up yet — check with the site admin."
        );
      }

      if (!res.ok) throw new Error(json.error || "Registration failed");
      setResult({ project_code: json.project_code! });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-lg rounded-2xl border border-line bg-surface p-8 text-center shadow-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 15 }}
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-marigold-light"
        >
          <span className="text-2xl">✓</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="font-display text-xl font-semibold text-ink"
        >
          Registration confirmed
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-2 text-sm text-muted"
        >
          Your project code is
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          className="mt-1 font-display text-2xl font-bold tracking-wide text-marigold"
        >
          {result.project_code}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-4 text-sm text-muted"
        >
          A verification email has been sent to{" "}
          <span className="font-medium text-ink">{data.leader_email}</span>. The team
          leader should check their inbox to set a portal password.
        </motion.p>
      </motion.div>
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
                          placeholder="Full name"
                          value={m.full_name}
                          onChange={(e) => {
                            const members = [...data.members];
                            members[i] = { ...m, full_name: e.target.value };
                            update("members", members);
                          }}
                        />
                        <TextInput
                          placeholder="Email"
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
              Location &amp; institution
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
          <div className="space-y-5">
            <h2 className="font-display text-lg font-semibold text-ink">
              Sector
            </h2>
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
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h2 className="font-display text-lg font-semibold text-ink">
              Project details
            </h2>
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

            <div className="rounded-lg border border-line bg-paper p-4">
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
          {step < 4 ? (
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
              {submitting ? "Submitting..." : "Submit registration"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
