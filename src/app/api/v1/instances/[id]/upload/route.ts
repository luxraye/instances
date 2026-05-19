import { NextResponse } from "next/server";
import { getSessionOrApiKey } from "@/lib/request-context";
import { uploadInstanceFile } from "@/lib/instance-service";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const resolved = await getSessionOrApiKey(request);
  if (!resolved) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const form = await request.formData();
  const slotKey = form.get("slotKey");
  const clientHash = form.get("clientHash");
  const file = form.get("file");

  if (typeof slotKey !== "string" || typeof clientHash !== "string" || !(file instanceof Blob)) {
    return NextResponse.json({ error: "Invalid form" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const originalName = (file as File).name || "upload";
  const ext = originalName.includes(".") ? originalName.split(".").pop() || "" : "";

  try {
    const row = await uploadInstanceFile({
      tenantId: resolved.ctx.tenantId,
      actorId: resolved.userId,
      instanceId: id,
      slotKey,
      buffer: buf,
      clientHash,
      originalName,
      extension: ext,
    });
    return NextResponse.json({
      id: row.id,
      slotKey: row.slotKey,
      serverHash: row.serverHash,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status = msg === "Forbidden" ? 403 : msg === "Not found" ? 404 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
