"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const BUCKET = "phase2-uploads";
const EXTENSIONS = ["pdf", "doc", "docx", "jpg", "jpeg", "png"];
const ACCEPT = ".pdf,.doc,.docx,.jpg,.jpeg,.png";
const MAX_MB = 20;
const MAX_FILES = 1;

export type OtherDocument = { name: string; path: string; uploaded_at: string };

function extOf(filename: string) {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

export function OtherDocumentsField({
  teamId,
  documents,
  onChange,
}: {
  teamId: string;
  documents: OtherDocument[];
  onChange: (docs: OtherDocument[]) => void;
}) {
  const [status, setStatus] = useState<"idle" | "uploading">("idle");
  const [error, setError] = useState<string | null>(null);
  const [removingPath, setRemovingPath] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);

    if (documents.length >= MAX_FILES) {
      setError(`You can attach up to ${MAX_FILES} extra documents.`);
      return;
    }
    const ext = extOf(file.name);
    if (!EXTENSIONS.includes(ext)) {
      setError(`Only ${EXTENSIONS.map((e) => `.${e}`).join(" / ")} files are accepted.`);
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`File is too large — max ${MAX_MB}MB.`);
      return;
    }

    setStatus("uploading");
    try {
      const supabase = createClient();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const objectPath = `${teamId}/other-${Date.now()}-${safeName}`;

      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(objectPath, file, { contentType: file.type || undefined });
      if (uploadErr) throw uploadErr;

      onChange([
        ...documents,
        { name: file.name, path: objectPath, uploaded_at: new Date().toISOString() },
      ]);
    } catch (err) {
      console.error("Extra document upload failed:", err);
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setStatus("idle");
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove(doc: OtherDocument) {
    setRemovingPath(doc.path);
    try {
      const supabase = createClient();
      // Best-effort delete from storage; even if this fails we still drop it
      // from the list so the participant isn't stuck looking at a dead entry.
      await supabase.storage.from(BUCKET).remove([doc.path]);
      onChange(documents.filter((d) => d.path !== doc.path));
    } catch (err) {
      console.error("Could not remove document:", err);
      onChange(documents.filter((d) => d.path !== doc.path));
    } finally {
      setRemovingPath(null);
    }
  }

  async function view(doc: OtherDocument) {
    try {
      const supabase = createClient();
      const { data, error: signErr } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(doc.path, 300);
      if (signErr || !data?.signedUrl) throw signErr ?? new Error("No URL");
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Could not open document:", err);
      setError("Could not open this file right now.");
    }
  }

  return (
    <div className="rounded-xl border border-line bg-paper p-4">
      <p className="text-sm font-semibold text-ink">Other supporting document</p>
      <p className="mt-0.5 text-xs text-muted">
        Optional — one additional document if you need to attach anything else.
      </p>
      <p className="mt-0.5 text-[11px] text-muted">
        Accepted: {ACCEPT} · Max {MAX_MB}MB · 1 file
      </p>

      {documents.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {documents.map((doc) => (
            <li
              key={doc.path}
              className="flex items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3 py-2"
            >
              <span className="truncate text-xs text-ink">{doc.name}</span>
              <span className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => view(doc)}
                  className="text-xs font-medium text-marigold hover:underline"
                >
                  View
                </button>
                <button
                  type="button"
                  onClick={() => remove(doc)}
                  disabled={removingPath === doc.path}
                  className="text-xs font-medium text-red-500 hover:underline disabled:opacity-60"
                >
                  {removingPath === doc.path ? "Removing..." : "Remove"}
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          id={`other-doc-${teamId}`}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        {documents.length < MAX_FILES && (
          <label
            htmlFor={`other-doc-${teamId}`}
            className={`inline-block cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold transition ${
              status === "uploading"
                ? "cursor-not-allowed bg-line text-muted"
                : "border border-line text-ink-light hover:border-marigold hover:text-marigold"
            }`}
            onClick={(e) => status === "uploading" && e.preventDefault()}
          >
            {status === "uploading" ? "Uploading..." : "+ Add document"}
          </label>
        )}
      </div>

      {error && <p className="mt-2 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
