import { NextResponse } from "next/server";
import { getSessionOrApiKey } from "@/lib/request-context";
import { provisionInstance } from "@/lib/instance-service";
import { z } from "zod";

const provisionBody = z.object({
  templateId: z.string().min(1),
  assigneeId: z.string().min(1),
  deadline: z.string().datetime(),
});

export async function POST(request: Request) {
  const resolved = await getSessionOrApiKey(request);
  if (!resolved) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (resolved.ctx.role !== "TENANT_ADMIN" && resolved.ctx.role !== "API") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await request.json().catch(() => null);
  const parsed = provisionBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const inst = await provisionInstance({
      tenantId: resolved.ctx.tenantId,
      actorId: resolved.userId,
      templateId: parsed.data.templateId,
      assigneeId: parsed.data.assigneeId,
      deadline: new Date(parsed.data.deadline),
      isApi: resolved.ctx.role === "API",
    });
    return NextResponse.json(inst, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
