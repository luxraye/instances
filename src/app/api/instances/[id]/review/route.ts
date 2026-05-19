import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { reviewInstance } from "@/lib/instance-service";
import { z } from "zod";

const bodySchema = z.object({
  status: z.enum(["APPROVED", "FLAGGED", "REJECTED"]),
  reviewNotes: z.string().optional(),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "TENANT_ADMIN" && session.user.role !== "REVIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    await reviewInstance({
      tenantId: session.user.tenantId,
      actorId: session.user.id,
      instanceId: id,
      status: parsed.data.status,
      reviewNotes: parsed.data.reviewNotes,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "Forbidden" ? 403 : msg === "Not found" ? 404 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
