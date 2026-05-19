import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role ?? "LICENSEE";

  return (
    <div className="flex min-h-screen" style={{ background: "#f4f6f9" }}>
      <div className="hidden md:block sticky top-0 h-screen overflow-hidden">
        <DashboardSidebar
          role={role}
          userName={session.user.name ?? ""}
          userEmail={session.user.email ?? ""}
        />
      </div>
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
