import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { provisionInstance } from "@/lib/instance-service";
import { z } from "zod";

const bodySchema = z.object({
  templateId: z.string().min(1),
  assigneeId: z.string().min(1),
  deadline: z.string().datetime(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "TENANT_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const inst = await provisionInstance({
      tenantId: session.user.tenantId,
      actorId: session.user.id,
      templateId: parsed.data.templateId,
      assigneeId: parsed.data.assigneeId,
      deadline: new Date(parsed.data.deadline),
    });
    return NextResponse.json(inst, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
