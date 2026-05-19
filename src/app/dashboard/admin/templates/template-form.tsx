"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const EXAMPLE = JSON.stringify(
  {
    jsonSchema: {
      type: "object",
      required: ["organisation_name", "reporting_period"],
      properties: {
        organisation_name: { type: "string", title: "Organisation name" },
        reporting_period: { type: "string", title: "Reporting period" },
        notes: { type: "string", title: "Additional notes" },
      },
    },
    fileSlots: [
      {
        key: "supporting_doc",
        label: "Supporting document (PDF)",
        extensions: ["pdf"],
        maxSizeMB: 10,
        required: false,
      },
    ],
  },
  null,
  2
);

const inputCls = "w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2";
const inputStyle = { borderColor: "#d9dde3", background: "#ffffff" };

export function TemplateForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [schemaText, setSchemaText] = useState(EXAMPLE);
  const [publish, setPublish] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    let schema: unknown;
    try {
      schema = JSON.parse(schemaText);
    } catch {
      setError("Invalid JSON — check the schema field.");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/tenant/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, name, description, schema, publish }),
    });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    setCode("");
    setName("");
    setDescription("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="rounded-xl border bg-white p-5 space-y-4" style={{ borderColor: "#d9dde3" }}>
      <h2 className="text-sm font-semibold" style={{ color: "#213976" }}>Create new template</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#374151" }}>
            Code <span className="text-red-500">*</span>
          </label>
          <input
            className={inputCls}
            style={inputStyle}
            placeholder="e.g. QMS-SURV-002"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#374151" }}>
            Name <span className="text-red-500">*</span>
          </label>
          <input
            className={inputCls}
            style={inputStyle}
            placeholder="e.g. QMS Annual Surveillance"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "#374151" }}>Description</label>
        <input
          className={inputCls}
          style={inputStyle}
          placeholder="Short description shown to licensees"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "#374151" }}>
          Schema JSON <span className="text-red-500">*</span>
        </label>
        <textarea
          className="w-full rounded-lg border px-3 py-2.5 text-xs font-mono outline-none focus:ring-2"
          style={{ borderColor: "#d9dde3", background: "#f8f9fa", minHeight: "220px" }}
          value={schemaText}
          onChange={(e) => setSchemaText(e.target.value)}
          required
          spellCheck={false}
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={publish}
          onChange={(e) => setPublish(e.target.checked)}
          className="rounded"
        />
        <span className="text-xs font-medium" style={{ color: "#374151" }}>
          Publish immediately (available for provisioning)
        </span>
      </label>

      {error && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="rounded-md px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        style={{ background: "#213976" }}
      >
        {busy ? "Creating..." : "Create template"}
      </button>
    </form>
  );
}
