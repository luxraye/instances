"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

const DEMO_ACCOUNTS = [
  { label: "BOBS Admin", email: "admin@bobs.gov.bw" },
  { label: "Reviewer", email: "reviewer@bobs.gov.bw" },
  { label: "Bokomo Botswana", email: "quality@bokomo.co.bw" },
  { label: "Bolux Group", email: "compliance@bolux.co.bw" },
  { label: "BVI", email: "quality@bvi.co.bw" },
  { label: "KALCON", email: "qms@kalcon.co.bw" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password. Demo password is: Bobs2026!");
      return;
    }
    window.location.href = "/dashboard";
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "#f4f6f9" }}>
      {/* Top bar */}
      <div style={{ background: "#213976" }} className="px-6 py-3 flex items-center gap-3">
        <div
          className="flex h-8 w-8 items-center justify-center rounded text-xs font-bold text-white"
          style={{ background: "#72bf40" }}
        >
          BOBS
        </div>
        <div>
          <p className="text-white text-sm font-semibold leading-tight">Botswana Bureau of Standards</p>
          <p className="text-blue-200 text-xs">Instances Portal</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Card */}
          <div className="rounded-xl border bg-white p-8 shadow-sm" style={{ borderColor: "#d9dde3" }}>
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold" style={{ color: "#213976" }}>Sign in to your portal</h1>
              <p className="text-sm mt-1" style={{ color: "#6c757d" }}>
                Enter your organisation credentials to continue
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#222733" }}>
                  Email address
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full rounded-md border px-3 py-2.5 text-sm outline-none focus:ring-2"
                  style={{
                    borderColor: "#d9dde3",
                    background: "#ffffff",
                    "--tw-ring-color": "#006bb7",
                  } as React.CSSProperties}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#222733" }}>
                  Password
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-md border px-3 py-2.5 text-sm outline-none focus:ring-2"
                  style={{ borderColor: "#d9dde3" } as React.CSSProperties}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error ? (
                <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                style={{ background: "#006bb7" }}
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>

          {/* Demo accounts */}
          <div className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "#d9dde3" }}>
            <p className="text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: "#6c757d" }}>
              Demo accounts — password: <code className="font-mono normal-case" style={{ color: "#213976" }}>Bobs2026!</code>
              <span className="ml-1 normal-case font-normal" style={{ color: "#6c757d" }}>(capital B, lowercase rest)</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => { setEmail(a.email); setPassword("Bobs2026!"); }}
                  className="rounded-md border px-2 py-1.5 text-left transition hover:border-blue-400 hover:bg-blue-50"
                  style={{ borderColor: "#d9dde3" }}
                >
                  <p className="text-xs font-medium" style={{ color: "#213976" }}>{a.label}</p>
                  <p className="text-xs truncate" style={{ color: "#6c757d" }}>{a.email}</p>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-xs" style={{ color: "#6c757d" }}>
            <Link href="/" className="hover:underline" style={{ color: "#006bb7" }}>
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
