import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bodySchema = z.object({
  label: z.string().min(1),
  code: z.string().min(1),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ dimensionId: string }> },
) {
  const session = await auth();
  if (!session?.user?.tenantId || session.user.role !== "TENANT_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { dimensionId } = await context.params;
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const dim = await prisma.matrixDimension.findFirst({
    where: { id: dimensionId, tenantId: session.user.tenantId },
  });
  if (!dim) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const v = await prisma.matrixDimensionValue.create({
      data: {
        dimensionId: dim.id,
        label: parsed.data.label,
        code: parsed.data.code,
      },
    });
    return NextResponse.json(v, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create (duplicate code?)" }, { status: 400 });
  }
}
