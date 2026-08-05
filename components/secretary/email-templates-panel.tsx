"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { EMAIL_TEMPLATE_TYPES } from "@/lib/notifications/templates";

type Override = { notification_type: string; subject: string; body: string; updated_at: string };

export function EmailTemplatesPanel({ initialOverrides }: { initialOverrides: Override[] }) {
  const [overrides, setOverrides] = useState<Record<string, Override>>(
    Object.fromEntries(initialOverrides.map((o) => [o.notification_type, o]))
  );
  const [drafts, setDrafts] = useState<Record<string, { subject: string; body: string }>>(
    Object.fromEntries(
      EMAIL_TEMPLATE_TYPES.map((t) => {
        const o = initialOverrides.find((ov) => ov.notification_type === t.type);
        return [t.type, { subject: o?.subject ?? t.defaultSubject, body: o?.body ?? t.defaultBody }];
      })
    )
  );
  const [expanded, setExpanded] = useState<string | null>(null);
  const [savingType, setSavingType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save(type: string) {
    setSavingType(type);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const draft = drafts[type];

    const { data: saved, error: saveErr } = await supabase
      .from("email_templates")
      .upsert({
        notification_type: type,
        subject: draft.subject,
        body: draft.body,
        updated_by: user?.id ?? null,
      })
      .select("notification_type, subject, body, updated_at")
      .single();

    if (saveErr || !saved) {
      setError(saveErr?.message || "Could not save template");
    } else {
      setOverrides((prev) => ({ ...prev, [type]: saved }));
    }
    setSavingType(null);
  }

  async function resetToDefault(type: string) {
    setSavingType(type);
    setError(null);
    const supabase = createClient();
    const { error: delErr } = await supabase.from("email_templates").delete().eq("notification_type", type);
    if (delErr) {
      setError(delErr.message);
    } else {
      setOverrides((prev) => {
        const next = { ...prev };
        delete next[type];
        return next;
      });
      const def = EMAIL_TEMPLATE_TYPES.find((t) => t.type === type);
      if (def) {
        setDrafts((prev) => ({ ...prev, [type]: { subject: def.defaultSubject, body: def.defaultBody } }));
      }
    }
    setSavingType(null);
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-marigold">Management</p>
      <h1 className="mt-1 font-display text-2xl font-bold text-ink">Email Templates</h1>
      <p className="mt-1 text-sm text-muted">
        Override the wording of any automated email. Use <code>{"{{variable}}"}</code> placeholders —
        each template lists which ones are available. Types left un-customized use the built-in
        default shown here.
      </p>

      {error && (
        <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {error}
        </p>
      )}

      <div className="mt-6 space-y-3">
        {EMAIL_TEMPLATE_TYPES.map((t) => {
          const isCustom = !!overrides[t.type];
          const isOpen = expanded === t.type;
          const draft = drafts[t.type];
          const saving = savingType === t.type;

          return (
            <div key={t.type} className="overflow-hidden rounded-2xl border border-line bg-surface">
              <button
                onClick={() => setExpanded(isOpen ? null : t.type)}
                className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
              >
                <div>
                  <p className="font-display text-sm font-semibold text-ink">{t.label}</p>
                  <p className="mt-0.5 text-xs text-muted">{t.type}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                    isCustom ? "bg-marigold/15 text-marigold" : "bg-line/40 text-muted"
                  }`}
                >
                  {isCustom ? "Custom" : "Default"}
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-line px-6 py-5">
                  <p className="text-xs text-muted">
                    Available variables:{" "}
                    {t.variables.map((v) => (
                      <code key={v} className="mr-1.5 rounded bg-paper px-1.5 py-0.5">
                        {`{{${v}}}`}
                      </code>
                    ))}
                  </p>

                  <label className="mt-3 block">
                    <span className="text-xs font-medium text-muted">Subject</span>
                    <input
                      value={draft.subject}
                      onChange={(e) =>
                        setDrafts((prev) => ({ ...prev, [t.type]: { ...draft, subject: e.target.value } }))
                      }
                      className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink"
                    />
                  </label>

                  <label className="mt-3 block">
                    <span className="text-xs font-medium text-muted">Body</span>
                    <textarea
                      value={draft.body}
                      onChange={(e) =>
                        setDrafts((prev) => ({ ...prev, [t.type]: { ...draft, body: e.target.value } }))
                      }
                      rows={6}
                      className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink"
                    />
                  </label>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => save(t.type)}
                      disabled={saving}
                      className="rounded-lg bg-marigold px-4 py-2 text-sm font-semibold text-ink disabled:opacity-60"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    {isCustom && (
                      <button
                        onClick={() => resetToDefault(t.type)}
                        disabled={saving}
                        className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-light disabled:opacity-60"
                      >
                        Reset to default
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
