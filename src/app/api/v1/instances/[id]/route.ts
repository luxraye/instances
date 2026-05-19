import { NextResponse } from "next/server";
import { getSessionOrApiKey } from "@/lib/request-context";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const resolved = await getSessionOrApiKey(request);
  if (!resolved) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const inst = await prisma.instance.findFirst({
    where: { id, tenantId: resolved.ctx.tenantId },
    include: {
      template: { select: { id: true, code: true, name: true, version: true, schema: true } },
      files: true,
      assignee: { select: { id: true, name: true, email: true } },
    },
  });

  if (!inst) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (resolved.ctx.role === "LICENSEE" && inst.assigneeId !== resolved.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(inst);
}
