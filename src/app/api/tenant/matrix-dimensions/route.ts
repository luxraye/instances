import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user?.tenantId || session.user.role !== "TENANT_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const dimensions = await prisma.matrixDimension.findMany({
    where: { tenantId: session.user.tenantId },
    include: { values: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(dimensions);
}

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
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

  try {
    const dim = await prisma.matrixDimension.create({
      data: {
        tenantId: session.user.tenantId,
        name: parsed.data.name,
        slug: parsed.data.slug,
      },
    });
    return NextResponse.json(dim, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create (duplicate slug?)" }, { status: 400 });
  }
}
