import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user?.tenantId || session.user.role !== "TENANT_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const templates = await prisma.template.findMany({
    where: { tenantId: session.user.tenantId },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(templates);
}

const createSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  schema: z.any(),
  publish: z.boolean().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.tenantId || session.user.role !== "TENANT_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const version = 1;
  try {
    const t = await prisma.template.create({
      data: {
        tenantId: session.user.tenantId,
        code: parsed.data.code,
        name: parsed.data.name,
        description: parsed.data.description,
        schema: parsed.data.schema as object,
        version,
        status: parsed.data.publish ? "PUBLISHED" : "DRAFT",
        publishedAt: parsed.data.publish ? new Date() : null,
      },
    });
    return NextResponse.json(t, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create template" }, { status: 400 });
  }
}
