import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TenantsClient } from "./tenants-client";

export default async function TenantsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "PLATFORM_ADMIN") {
    redirect("/login");
  }

  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, slug: true, status: true, createdAt: true },
  });

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Tenants</h1>
      <TenantsClient initialTenants={JSON.parse(JSON.stringify(tenants))} />
    </div>
  );
}
