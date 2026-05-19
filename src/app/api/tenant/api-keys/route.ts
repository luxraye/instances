import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateApiKey } from "@/lib/api-key-create";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user?.tenantId || session.user.role !== "TENANT_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const keys = await prisma.apiKey.findMany({
    where: { tenantId: session.user.tenantId, revokedAt: null },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      createdAt: true,
      lastUsedAt: true,
    },
  });
  return NextResponse.json(keys);
}

const createSchema = z.object({
  name: z.string().min(1),
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

  const { rawKey, prefix, keyHash } = await generateApiKey();

  const row = await prisma.apiKey.create({
    data: {
      tenantId: session.user.tenantId,
      name: parsed.data.name,
      keyPrefix: prefix,
      keyHash,
      createdById: session.user.id,
    },
  });

  return NextResponse.json({
    id: row.id,
    name: row.name,
    keyPrefix: row.keyPrefix,
    /** Shown once — store securely */
    rawKey,
  });
}
