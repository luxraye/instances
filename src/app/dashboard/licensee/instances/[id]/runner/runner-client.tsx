"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { JsonSchemaForm } from "@/components/json-schema-form";
import { parseTemplateSchema } from "@/lib/schema-engine/template";
import Link from "next/link";

async function sha256File(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

type InstanceData = {
  id: string;
  status: string;
  deadline: string;
  draftPayload: unknown;
  submissionPayload: unknown;
  submissionJwt: string | null;
  reviewNotes: string | null;
  template: { name: string; code: string; description?: string | null; schema: unknown };
  files: { slotKey: string; fileName: string; serverHash: string }[];
};

const STATUS_META: Record<string, { label: string; badge: string; text: string }> = {
  PENDING:     { label: "Pending",              badge: "badge-pending",   text: "Not started — fill in the form below and save a draft or submit." },
  IN_PROGRESS: { label: "In Progress",          badge: "badge-progress",  text: "Draft saved — complete all fields and submit when ready." },
  SUBMITTED:   { label: "Submitted",            badge: "badge-submitted", text: "Your submission is with BOBS for review. No further action needed." },
  APPROVED:    { label: "Approved",             badge: "badge-approved",  text: "BOBS has approved this submission." },
  FLAGGED:     { label: "Flagged — Action Required", badge: "badge-flagged", text: "BOBS has returned this submission. Review the note below and resubmit." },
  REJECTED:    { label: "Rejected",             badge: "badge-rejected",  text: "This submission has been rejected by BOBS." },
};

export function RunnerClient({ instance }: { instance: InstanceData }) {
  const router = useRouter();
  const doc = useMemo(() => parseTemplateSchema(instance.template.schema), [instance.template.schema]);
  const jsonSchema = doc.jsonSchema as Record<string, unknown>;

  const initial = useMemo(() => {
    const d = instance.draftPayload;
    if (d && typeof d === "object" && !Array.isArray(d)) return d as Record<string, unknown>;
    return {} as Record<string, unknown>;
  }, [instance.draftPayload]);

  const [values, setValues] = useState<Record<string, unknown>>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const readOnly = !["PENDING", "IN_PROGRESS", "FLAGGED"].includes(instance.status);

  const meta = STATUS_META[instance.status] ?? { label: instance.status, badge: "", text: "" };

  async function saveDraft() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/instances/${instance.id}/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSavedAt(new Date());
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const draftRes = await fetch(`/api/instances/${instance.id}/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!draftRes.ok) throw new Error("Draft save failed");

      const res = await fetch(`/api/instances/${instance.id}/submit`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Submit failed");
      router.push("/dashboard/licensee/instances");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function onFile(slotKey: string, file: File | null) {
    if (!file || readOnly) return;
    const clientHash = await sha256File(file);
    const fd = new FormData();
    fd.set("slotKey", slotKey);
    fd.set("clientHash", clientHash);
    fd.set("file", file);
    const res = await fetch(`/api/instances/${instance.id}/upload`, { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Upload failed");
    router.refresh();
  }

  return (
    <div className="max-w-2xl space-y-6 pb-12">
      {/* Back */}
      <Link
        href="/dashboard/licensee/instances"
        className="inline-flex items-center gap-1.5 text-sm hover:underline"
        style={{ color: "#006bb7" }}
      >
        ← My Submissions
      </Link>

      {/* Header card */}
      <div className="rounded-xl border bg-white p-6" style={{ borderColor: "#d9dde3" }}>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#213976" }}>{instance.template.name}</h1>
            <p className="text-xs font-mono mt-0.5" style={{ color: "#6c757d" }}>{instance.template.code}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.badge}`}>{meta.label}</span>
        </div>

        {instance.template.description && (
          <p className="text-sm mb-3" style={{ color: "#6c757d" }}>{instance.template.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: "#6c757d" }}>
          <span>
            Due: <strong>{new Date(instance.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</strong>
          </span>
          {savedAt && (
            <span style={{ color: "#16a34a" }}>
              ✓ Draft saved at {savedAt.toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Status message */}
        {meta.text && (
          <p
            className="mt-3 rounded-md px-3 py-2 text-xs"
            style={{
              background: instance.status === "FLAGGED" ? "#fff7ed" : "#edf3f9",
              color: instance.status === "FLAGGED" ? "#7c2d12" : "#374151",
            }}
          >
            {meta.text}
          </p>
        )}

        {/* Review notes */}
        {instance.reviewNotes && (
          <div
            className="mt-3 rounded-md border-l-4 px-4 py-3 text-sm"
            style={{ borderColor: "#c2410c", background: "#fff7ed", color: "#7c2d12" }}
          >
            <p className="font-semibold text-xs uppercase tracking-wide mb-1">BOBS Review Note</p>
            {instance.reviewNotes}
          </div>
        )}
      </div>

      {/* Submitted view */}
      {readOnly && instance.submissionPayload ? (
        <div className="rounded-xl border bg-white p-5" style={{ borderColor: "#d9dde3" }}>
          <h2 className="text-sm font-semibold mb-3" style={{ color: "#213976" }}>Submitted data</h2>
          <pre
            className="max-h-80 overflow-auto rounded-lg p-3 text-xs"
            style={{ background: "#f4f6f9", color: "#222733", fontFamily: "monospace" }}
          >
            {JSON.stringify(instance.submissionPayload, null, 2)}
          </pre>
        </div>
      ) : (
        /* Form */
        <div className="rounded-xl border bg-white p-5" style={{ borderColor: "#d9dde3" }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: "#213976" }}>Submission form</h2>
          <JsonSchemaForm
            schema={jsonSchema}
            value={values}
            onChange={setValues}
            disabled={readOnly}
          />
        </div>
      )}

      {/* File uploads */}
      {doc.fileSlots?.length ? (
        <div className="rounded-xl border bg-white p-5" style={{ borderColor: "#d9dde3" }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: "#213976" }}>Required documents</h2>
          <div className="space-y-4">
            {doc.fileSlots.map((slot) => {
              const existing = instance.files.find((f) => f.slotKey === slot.key);
              return (
                <div
                  key={slot.key}
                  className="rounded-lg border p-4"
                  style={{ borderColor: existing ? "#86efac" : "#d9dde3", background: existing ? "#f0fdf4" : "#fafafa" }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium" style={{ color: "#213976" }}>
                        {slot.label}
                        {slot.required && <span className="ml-1 text-red-500">*</span>}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#6c757d" }}>
                        Accepted: {slot.extensions.join(", ")} · Max {slot.maxSizeMB} MB
                      </p>
                    </div>
                    {existing && (
                      <span className="text-xs font-medium" style={{ color: "#16a34a" }}>✓ Uploaded</span>
                    )}
                  </div>
                  {existing && (
                    <p className="mt-2 text-xs" style={{ color: "#6c757d" }}>
                      {existing.fileName} · {existing.serverHash.slice(0, 16)}…
                    </p>
                  )}
                  {!readOnly && (
                    <input
                      type="file"
                      className="mt-3 block text-sm"
                      accept={slot.extensions.map((e) => `.${e}`).join(",")}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void onFile(slot.key, f).catch((err: Error) => setError(err.message));
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Error */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Actions */}
      {!readOnly && (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-md border px-5 py-2.5 text-sm font-medium transition hover:bg-gray-50 disabled:opacity-50"
            style={{ borderColor: "#d9dde3", color: "#374151" }}
            disabled={saving}
            onClick={() => void saveDraft()}
          >
            {saving ? "Saving…" : "Save draft"}
          </button>
          <button
            type="button"
            className="rounded-md px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ background: "#006bb7" }}
            disabled={saving}
            onClick={() => void submit()}
          >
            Submit to BOBS →
          </button>
        </div>
      )}

      {/* JWT receipt */}
      {instance.submissionJwt && (
        <div className="rounded-lg border p-4" style={{ borderColor: "#d9dde3", background: "#f4f6f9" }}>
          <p className="text-xs font-semibold mb-1" style={{ color: "#213976" }}>Submission receipt (JWT)</p>
          <p className="break-all text-xs font-mono" style={{ color: "#6c757d" }}>{instance.submissionJwt}</p>
        </div>
      )}
    </div>
  );
}
