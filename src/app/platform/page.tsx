import Link from "next/link";

export default function PlatformHomePage() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Platform</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">Manage regulatory tenants.</p>
      <Link
        href="/platform/tenants"
        className="mt-6 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500"
      >
        Tenants
      </Link>
    </div>
  );
}
