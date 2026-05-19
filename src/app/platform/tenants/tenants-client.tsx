"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: string;
};

export function TenantsClient({ initialTenants }: { initialTenants: Tenant[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/platform/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    setName("");
    setSlug("");
    router.refresh();
  }

  return (
    <>
      <form onSubmit={create} className="mt-6 space-y-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
        <h2 className="font-medium">Create tenant</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
            placeholder="Slug (lowercase)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button type="submit" className="rounded bg-indigo-600 px-3 py-1.5 text-sm text-white">
          Create
        </button>
      </form>
      <ul className="mt-8 space-y-2 text-sm">
        {initialTenants.map((t) => (
          <li key={t.id} className="rounded border border-slate-200 px-3 py-2 dark:border-slate-700">
            <span className="font-medium">{t.name}</span>{" "}
            <code className="text-xs text-slate-500">{t.slug}</code> — {t.status}
          </li>
        ))}
      </ul>
    </>
  );
}
