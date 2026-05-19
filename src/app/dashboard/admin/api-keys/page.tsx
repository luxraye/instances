import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ApiKeyClient } from "./api-key-client";

export default async function ApiKeysPage() {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");
  if (session.user.role !== "TENANT_ADMIN") redirect("/dashboard/admin");

  const keys = await prisma.apiKey.findMany({
    where: { tenantId: session.user.tenantId, revokedAt: null },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, keyPrefix: true, createdAt: true, lastUsedAt: true },
  });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#213976" }}>API Keys</h1>
        <p className="mt-1 text-sm" style={{ color: "#6c757d" }}>
          Programmatic access to the BOBS Instances REST API. Keys are hashed on creation - store them securely.
        </p>
      </div>
      <ApiKeyClient initialKeys={JSON.parse(JSON.stringify(keys))} />
    </div>
  );
}
