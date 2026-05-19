import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { submitInstance } from "@/lib/instance-service";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const { submissionJwt } = await submitInstance({
      tenantId: session.user.tenantId,
      actorId: session.user.id,
      instanceId: id,
    });
    return NextResponse.json({ ok: true, submissionJwt });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "Forbidden" ? 403 : msg === "Not found" ? 404 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
