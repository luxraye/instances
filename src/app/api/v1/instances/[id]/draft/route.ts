import { NextResponse } from "next/server";
import { getSessionOrApiKey } from "@/lib/request-context";
import { saveDraft } from "@/lib/instance-service";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const resolved = await getSessionOrApiKey(request);
  if (!resolved) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const payload = await request.json();

  try {
    await saveDraft({
      tenantId: resolved.ctx.tenantId,
      actorId: resolved.userId,
      instanceId: id,
      payload,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "Forbidden" ? 403 : msg === "Not found" ? 404 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
