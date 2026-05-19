import { auth } from "@/auth";
import { resolveApiKeyRequest } from "@/lib/api-auth";
import type { TenantContext } from "@/lib/tenant-context";

export async function getSessionOrApiKey(
  request: Request,
): Promise<{ ctx: TenantContext; userId: string } | null> {
  const session = await auth();
  if (session?.user?.id && session.user.tenantId) {
    return {
      ctx: {
        tenantId: session.user.tenantId,
        role: session.user.role,
        userId: session.user.id,
      },
      userId: session.user.id,
    };
  }
  if (session?.user?.id && session.user.role === "PLATFORM_ADMIN") {
    return null;
  }

  const api = await resolveApiKeyRequest(request.headers.get("authorization"));
  if (api?.userId) {
    return { ctx: api, userId: api.userId! };
  }
  return null;
}
