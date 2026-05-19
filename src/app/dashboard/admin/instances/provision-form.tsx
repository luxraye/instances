"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProvisionForm({
  templates,
  licensees,
}: {
  templates: { id: string; name: string; code: string }[];
  licensees: { id: string; name: string | null; email: string }[];
}) {
  const router = useRouter();
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [assigneeId, setAssigneeId] = useState(licensees[0]?.id ?? "");
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch("/api/instances/provision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateId,
        assigneeId,
        deadline: new Date(deadline).toISOString(),
      }),
    });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    router.refresh();
  }

  const selectCls = "w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2";
  const selectStyle = { borderColor: "#d9dde3", background: "#ffffff" };

  if (!templates.length || !licensees.length) {
    return (
      <div className="rounded-lg border p-4 text-sm" style={{ borderColor: "#fde047", background: "#fefce8", color: "#854d0e" }}>
        Need at least one published template and one licensee to provision a submission.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-xl border bg-white p-5 space-y-4" style={{ borderColor: "#d9dde3" }}>
      <h2 className="text-sm font-semibold" style={{ color: "#213976" }}>Provision new submission</h2>

      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "#374151" }}>Service template</label>
        <select className={selectCls} style={selectStyle} value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} · {t.code}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "#374151" }}>Assign to organisation</label>
        <select className={selectCls} style={selectStyle} value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
          {licensees.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name ?? u.email}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "#374151" }}>Submission deadline</label>
        <input
          type="date"
          className={selectCls}
          style={selectStyle}
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
        />
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="rounded-md px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        style={{ background: "#213976" }}
      >
        {busy ? "Provisioning…" : "Provision submission"}
      </button>
    </form>
  );
}
