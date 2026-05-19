"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Inst = {
  id: string;
  status: string;
  submittedAt: string | null;
  deadline: string;
  submissionPayload: unknown;
  reviewNotes: string | null;
  template: { name: string; code: string };
  assignee: { name: string; email: string };
  files: { slotKey: string; fileName: string; serverHash: string }[];
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    SUBMITTED: "badge-submitted",
    FLAGGED: "badge-flagged",
    REJECTED: "badge-rejected",
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] ?? ""}`}>
      {status}
    </span>
  );
}

export function ReviewClient({ instances }: { instances: Inst[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState(instances[0]?.id ?? "");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const current = instances.find((i) => i.id === selected);

  async function decide(status: "APPROVED" | "FLAGGED" | "REJECTED") {
    if (!selected) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/v1/instances/${selected}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewNotes: notes || undefined }),
      });
      if (!res.ok) throw new Error("Failed");
      setNotes("");
      setToast(`Marked as ${status}`);
      setTimeout(() => setToast(null), 3000);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (!instances.length) {
    return (
      <div className="mt-8 rounded-xl border bg-white p-10 text-center" style={{ borderColor: "#d9dde3" }}>
        <p className="text-4xl mb-3">✅</p>
        <p className="font-medium" style={{ color: "#213976" }}>Queue is clear</p>
        <p className="text-sm mt-1" style={{ color: "#6c757d" }}>No submissions are awaiting review.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
      {/* Sidebar list */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#6c757d" }}>
          {instances.length} awaiting decision
        </p>
        <ul className="space-y-1">
          {instances.map((i) => (
            <li key={i.id}>
              <button
                type="button"
                onClick={() => { setSelected(i.id); setNotes(""); }}
                className="w-full rounded-lg border px-3 py-2.5 text-left transition"
                style={{
                  background: selected === i.id ? "#edf3f9" : "#ffffff",
                  borderColor: selected === i.id ? "#006bb7" : "#d9dde3",
                }}
              >
                <p className="text-xs font-semibold truncate" style={{ color: "#213976" }}>{i.template.code}</p>
                <p className="text-xs truncate" style={{ color: "#222733" }}>{i.assignee.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "#6c757d" }}>
                  Submitted {i.submittedAt ? new Date(i.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Detail panel */}
      {current ? (
        <div className="space-y-5">
          {/* Header */}
          <div className="rounded-xl border bg-white p-5" style={{ borderColor: "#d9dde3" }}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold" style={{ color: "#213976" }}>{current.template.name}</h2>
                <p className="text-xs font-mono mt-0.5" style={{ color: "#6c757d" }}>{current.template.code}</p>
              </div>
              <StatusBadge status={current.status} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#6c757d" }}>Organisation</p>
                <p style={{ color: "#222733" }}>{current.assignee.name}</p>
                <p style={{ color: "#6c757d" }}>{current.assignee.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#6c757d" }}>Timeline</p>
                <p style={{ color: "#222733" }}>
                  Submitted: {current.submittedAt ? new Date(current.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                </p>
                <p style={{ color: "#222733" }}>
                  Deadline: {new Date(current.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>

          {/* Payload */}
          <div className="rounded-xl border bg-white p-5" style={{ borderColor: "#d9dde3" }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "#213976" }}>Submission payload</h3>
            <pre
              className="max-h-72 overflow-auto rounded-lg p-3 text-xs"
              style={{ background: "#f4f6f9", color: "#222733", fontFamily: "monospace" }}
            >
              {JSON.stringify(current.submissionPayload, null, 2)}
            </pre>
          </div>

          {/* Files */}
          {current.files.length > 0 && (
            <div className="rounded-xl border bg-white p-5" style={{ borderColor: "#d9dde3" }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: "#213976" }}>Attached files</h3>
              <ul className="space-y-2">
                {current.files.map((f) => (
                  <li key={f.slotKey} className="flex items-center gap-2 text-sm">
                    <span className="text-lg">📎</span>
                    <div>
                      <p className="font-medium" style={{ color: "#222733" }}>{f.fileName}</p>
                      <p className="text-xs font-mono" style={{ color: "#6c757d" }}>
                        Slot: {f.slotKey} · Hash: {f.serverHash.slice(0, 16)}…
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Previous review notes */}
          {current.reviewNotes && (
            <div className="rounded-xl border p-4" style={{ borderColor: "#fdba74", background: "#fff7ed" }}>
              <p className="text-xs font-semibold mb-1" style={{ color: "#c2410c" }}>Previous review note</p>
              <p className="text-sm" style={{ color: "#7c2d12" }}>{current.reviewNotes}</p>
            </div>
          )}

          {/* Decision */}
          <div className="rounded-xl border bg-white p-5" style={{ borderColor: "#d9dde3" }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "#213976" }}>Decision</h3>
            <textarea
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: "#d9dde3" }}
              placeholder="Review notes (required when flagging or rejecting)"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                className="rounded-md px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                style={{ background: "#166534" }}
                onClick={() => void decide("APPROVED")}
              >
                ✓ Approve
              </button>
              <button
                type="button"
                disabled={busy}
                className="rounded-md px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                style={{ background: "#c2410c" }}
                onClick={() => void decide("FLAGGED")}
              >
                ⚑ Flag for revision
              </button>
              <button
                type="button"
                disabled={busy}
                className="rounded-md px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                style={{ background: "#991b1b" }}
                onClick={() => void decide("REJECTED")}
              >
                ✕ Reject
              </button>
            </div>
          </div>

          {toast && (
            <div
              className="fixed bottom-6 right-6 rounded-lg px-5 py-3 text-sm font-medium text-white shadow-lg"
              style={{ background: "#166534" }}
            >
              {toast}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
