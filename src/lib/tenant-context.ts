/** User roles — mirrors the Role enum in prisma/schema.prisma */
export type Role = "PLATFORM_ADMIN" | "TENANT_ADMIN" | "REVIEWER" | "LICENSEE";

/** Resolved tenant for the current request (session or API key). */
export type TenantContext = {
  tenantId: string;
  role: Role | "API";
  userId?: string;
};

export function assertTenantRole(
  ctx: TenantContext | null,
  allowed: Role[],
): asserts ctx is TenantContext & { role: Role } {
  if (!ctx) throw new Error("Unauthorized");
  if (ctx.role === "API") return;
  if (!allowed.includes(ctx.role)) throw new Error("Forbidden");
}
