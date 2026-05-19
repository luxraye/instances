"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Dim = {
  id: string;
  name: string;
  slug: string;
  values: { id: string; label: string; code: string }[];
};

const inputCls = "rounded-lg border px-3 py-2 text-sm outline-none";
const inputStyle = { borderColor: "#d9dde3", background: "#ffffff" };

export function MatrixAdmin({ initialDimensions }: { initialDimensions: Dim[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function addDimension(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch("/api/tenant/matrix-dimensions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug }),
    });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setError(data.error || "Failed"); return; }
    setName("");
    setSlug("");
    router.refresh();
  }

  return (
    <div className="space-y-8 mt-2">
      <form onSubmit={addDimension} className="rounded-xl border bg-white p-5 space-y-4" style={{ borderColor: "#d9dde3" }}>
        <h2 className="text-sm font-semibold" style={{ color: "#213976" }}>Add classification dimension</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#374151" }}>Dimension name</label>
            <input
              className={inputCls} style={inputStyle}
              placeholder="e.g. Industry Sector"
              value={name} onChange={(e) => setName(e.target.value)} required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#374151" }}>Slug (URL-safe)</label>
            <input
              className={inputCls} style={inputStyle}
              placeholder="e.g. sector"
              value={slug} onChange={(e) => setSlug(e.target.value)} required
            />
          </div>
        </div>
        {error && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}
        <button
          type="submit" disabled={busy}
          className="rounded-md px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          style={{ background: "#213976" }}
        >
          {busy ? "Adding..." : "Add dimension"}
        </button>
      </form>

      {initialDimensions.length === 0 ? (
        <p className="text-sm" style={{ color: "#6c757d" }}>No dimensions yet. Add one above.</p>
      ) : (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "#6c757d" }}>
            Dimensions ({initialDimensions.length})
          </h2>
          {initialDimensions.map((d) => (
            <DimensionBlock key={d.id} dimension={d} onRefresh={() => router.refresh()} />
          ))}
        </div>
      )}
    </div>
  );
}

function DimensionBlock({ dimension, onRefresh }: { dimension: Dim; onRefresh: () => void }) {
  const [label, setLabel] = useState("");
  const [code, setCode] = useState("");

  async function addValue(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/tenant/matrix-dimensions/${dimension.id}/values`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, code }),
    });
    setLabel("");
    setCode("");
    onRefresh();
  }

  return (
    <div className="rounded-xl border bg-white p-5" style={{ borderColor: "#d9dde3" }}>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold" style={{ color: "#213976" }}>{dimension.name}</h3>
        <code className="text-xs rounded px-1.5 py-0.5 font-mono" style={{ background: "#edf3f9", color: "#006bb7" }}>
          {dimension.slug}
        </code>
      </div>

      {dimension.values.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-4">
          {dimension.values.map((v) => (
            <span
              key={v.id}
              className="rounded-full border px-3 py-1 text-xs"
              style={{ borderColor: "#d9dde3", background: "#f4f6f9", color: "#374151" }}
            >
              {v.label}
              <code className="ml-1.5 font-mono text-xs" style={{ color: "#6c757d" }}>{v.code}</code>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs mb-4" style={{ color: "#9ca3af" }}>No values yet.</p>
      )}

      <form onSubmit={addValue} className="flex flex-wrap items-end gap-2">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "#6c757d" }}>Label</label>
          <input
            className="rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ borderColor: "#d9dde3", background: "#ffffff" }}
            placeholder="e.g. Food & Agro-processing"
            value={label} onChange={(e) => setLabel(e.target.value)} required
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "#6c757d" }}>Code</label>
          <input
            className="rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ borderColor: "#d9dde3", background: "#ffffff" }}
            placeholder="e.g. food-agro"
            value={code} onChange={(e) => setCode(e.target.value)} required
          />
        </div>
        <button
          type="submit"
          className="rounded-md border px-3 py-2 text-sm font-medium transition hover:bg-gray-50"
          style={{ borderColor: "#d9dde3", color: "#374151" }}
        >
          + Add value
        </button>
      </form>
    </div>
  );
}
