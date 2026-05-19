import Link from "next/link";
import { signOutAction } from "@/app/actions/sign-out";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link href="/platform" className="font-semibold text-slate-900 dark:text-white">
            Instances — Platform
          </Link>
          <form action={signOutAction}>
            <button type="submit" className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
