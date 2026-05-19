"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type KeyRow = {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
};

export function ApiKeyClient({ initialKeys }: { initialKeys: KeyRow[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [once, setOnce] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function createKey(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOnce(null);
    setBusy(true);
    const res = await fetch("/api/tenant/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setError(data.error || "Failed"); return; }
    setOnce(data.rawKey as string);
    setName("");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={createKey} className="rounded-xl border bg-white p-5 space-y-4" style={{ borderColor: "#d9dde3" }}>
        <h2 className="text-sm font-semibold" style={{ color: "#213976" }}>Generate new API key</h2>
        <p className="text-xs" style={{ color: "#6c757d" }}>
          Use <code className="font-mono bg-gray-100 px-1 rounded">Authorization: Bearer &lt;key&gt;</code> with{" "}
          <code className="font-mono bg-gray-100 px-1 rounded">/api/v1/*</code> endpoints.
        </p>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#374151" }}>Key label</label>
          <input
            className="w-full max-w-md rounded-lg border px-3 py-2.5 text-sm outline-none"
            style={{ borderColor: "#d9dde3" }}
            placeholder="e.g. External integration - BotswanaTrade Portal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {once && (
          <div className="rounded-lg border p-4" style={{ background: "#fefce8", borderColor: "#fde047" }}>
            <p className="text-xs font-semibold mb-1" style={{ color: "#854d0e" }}>
              Copy now - this key will not be shown again
            </p>
            <code className="block break-all text-sm font-mono" style={{ color: "#1c1917" }}>{once}</code>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="rounded-md px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          style={{ background: "#213976" }}
        >
          {busy ? "Generating..." : "Generate key"}
        </button>
      </form>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: "#6c757d" }}>
          Active keys ({initialKeys.length})
        </h2>
        {initialKeys.length === 0 ? (
          <div className="rounded-xl border bg-white p-6 text-center" style={{ borderColor: "#d9dde3" }}>
            <p className="text-sm" style={{ color: "#6c757d" }}>No API keys yet.</p>
          </div>
        ) : (
          <div className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: "#d9dde3" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#f4f6f9", borderBottom: "1px solid #d9dde3" }}>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#6c757d" }}>Label</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#6c757d" }}>Prefix</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#6c757d" }}>Created</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#6c757d" }}>Last used</th>
                </tr>
              </thead>
              <tbody>
                {initialKeys.map((k, i) => (
                  <tr key={k.id} style={{ borderTop: i === 0 ? undefined : "1px solid #f0f0f0" }}>
                    <td className="px-4 py-3 font-medium text-sm" style={{ color: "#222733" }}>{k.name}</td>
                    <td className="px-4 py-3">
                      <code className="font-mono text-xs" style={{ color: "#6c757d" }}>{k.keyPrefix}...</code>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#6c757d" }}>
                      {new Date(k.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#6c757d" }}>
                      {k.lastUsedAt
                        ? new Date(k.lastUsedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                        : "Never"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
