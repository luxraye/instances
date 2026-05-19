import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { TenantContext } from "@/lib/tenant-context";

export async function resolveApiKeyRequest(
  authHeader: string | null,
): Promise<TenantContext | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const raw = authHeader.slice(7).trim();
  if (!raw.length) return null;
  const prefix = raw.slice(0, 12);

  const keys = await prisma.apiKey.findMany({
    where: { keyPrefix: prefix, revokedAt: null },
    include: { tenant: true },
  });

  for (const k of keys) {
    const match = await bcrypt.compare(raw, k.keyHash);
    if (match && k.tenant.status === "ACTIVE") {
      await prisma.apiKey.update({
        where: { id: k.id },
        data: { lastUsedAt: new Date() },
      });
      return { tenantId: k.tenantId, role: "API", userId: k.createdById };
    }
  }
  return null;
}
