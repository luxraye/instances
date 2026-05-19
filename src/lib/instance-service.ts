type InstanceStatus = "PENDING" | "IN_PROGRESS" | "SUBMITTED" | "APPROVED" | "FLAGGED" | "REJECTED";
import { prisma } from "@/lib/prisma";
import { signSubmissionReceipt } from "@/lib/jwt-sign";
import { sha256Buffer } from "@/lib/hash";
import { storage } from "@/lib/storage";
import { defaultEmptyPayload, parseTemplateSchema } from "@/lib/schema-engine/template";
import { validateAgainstTemplate, formatAjvErrors } from "@/lib/schema-engine/validate";
import { writeAudit } from "@/lib/audit";

export async function provisionInstance(params: {
  tenantId: string;
  actorId: string;
  templateId: string;
  assigneeId: string;
  deadline: Date;
  /** When true, caller is a service account (API); skips role check on actor */
  isApi?: boolean;
}) {
  const actor = await prisma.user.findUnique({ where: { id: params.actorId } });
  if (!params.isApi) {
    if (!actor?.tenantId || actor.tenantId !== params.tenantId) throw new Error("Forbidden");
    if (actor.role !== "TENANT_ADMIN") throw new Error("Forbidden");
  }

  const template = await prisma.template.findFirst({
    where: { id: params.templateId, tenantId: params.tenantId, status: "PUBLISHED" },
  });
  if (!template) throw new Error("Template not found");

  const assignee = await prisma.user.findFirst({
    where: { id: params.assigneeId, tenantId: params.tenantId, role: "LICENSEE" },
  });
  if (!assignee) throw new Error("Assignee not found");

  const doc = parseTemplateSchema(template.schema);
  const draftPayload = defaultEmptyPayload(doc.jsonSchema as Record<string, unknown>);

  const inst = await prisma.instance.create({
    data: {
      tenantId: params.tenantId,
      templateId: template.id,
      assigneeId: assignee.id,
      provisionedById: params.actorId,
      deadline: params.deadline,
      status: "PENDING",
      draftPayload: draftPayload as object,
    },
  });

  await writeAudit({
    tenantId: params.tenantId,
    actorId: params.actorId,
    action: "INSTANCE_PROVISIONED",
    entityType: "Instance",
    entityId: inst.id,
    metadata: { templateId: template.id },
  });

  return inst;
}

export async function saveDraft(params: {
  tenantId: string;
  actorId: string;
  instanceId: string;
  payload: unknown;
}) {
  const user = await prisma.user.findUnique({ where: { id: params.actorId } });
  if (!user?.tenantId || user.tenantId !== params.tenantId) throw new Error("Forbidden");

  const inst = await prisma.instance.findFirst({
    where: { id: params.instanceId, tenantId: params.tenantId },
    include: { template: true },
  });
  if (!inst) throw new Error("Not found");
  if (inst.assigneeId !== params.actorId && user.role !== "TENANT_ADMIN") {
    throw new Error("Forbidden");
  }
  if (!["PENDING", "IN_PROGRESS"].includes(inst.status)) throw new Error("Read only");

  const doc = parseTemplateSchema(inst.template.schema);
  const v = validateAgainstTemplate(doc, params.payload);
  if (!v.ok) throw new Error(formatAjvErrors(v.errors));

  await prisma.instance.update({
    where: { id: inst.id },
    data: {
      draftPayload: v.data as object,
      status: "IN_PROGRESS",
    },
  });

  return { ok: true };
}

export async function submitInstance(params: {
  tenantId: string;
  actorId: string;
  instanceId: string;
}) {
  const user = await prisma.user.findUnique({ where: { id: params.actorId } });
  if (!user?.tenantId || user.tenantId !== params.tenantId) throw new Error("Forbidden");

  const inst = await prisma.instance.findFirst({
    where: { id: params.instanceId, tenantId: params.tenantId },
    include: { template: true, files: true },
  });
  if (!inst) throw new Error("Not found");
  if (inst.assigneeId !== params.actorId) throw new Error("Forbidden");
  if (!["PENDING", "IN_PROGRESS"].includes(inst.status)) throw new Error("Already submitted");

  const doc = parseTemplateSchema(inst.template.schema);
  const payload = inst.draftPayload ?? defaultEmptyPayload(doc.jsonSchema as Record<string, unknown>);
  const v = validateAgainstTemplate(doc, payload);
  if (!v.ok) throw new Error(formatAjvErrors(v.errors));

  if (doc.fileSlots?.length) {
    for (const slot of doc.fileSlots) {
      if (!slot.required) continue;
      const has = inst.files.some((f: { slotKey: string }) => f.slotKey === slot.key);
      if (!has) throw new Error(`Missing required file: ${slot.label}`);
    }
  }

  const submittedAt = new Date().toISOString();
  const submissionJwt = signSubmissionReceipt({
    instanceId: inst.id,
    tenantId: inst.tenantId,
    templateId: inst.templateId,
    assigneeId: inst.assigneeId,
    submittedAt,
  });

  await prisma.instance.update({
    where: { id: inst.id },
    data: {
      status: "SUBMITTED",
      submissionPayload: v.data as object,
      submissionJwt,
      submittedAt: new Date(submittedAt),
    },
  });

  await writeAudit({
    tenantId: params.tenantId,
    actorId: params.actorId,
    action: "INSTANCE_SUBMITTED",
    entityType: "Instance",
    entityId: inst.id,
  });

  return { submissionJwt };
}

export async function uploadInstanceFile(params: {
  tenantId: string;
  actorId: string;
  instanceId: string;
  slotKey: string;
  buffer: Buffer;
  clientHash: string;
  originalName: string;
  extension: string;
}) {
  const user = await prisma.user.findUnique({ where: { id: params.actorId } });
  if (!user?.tenantId || user.tenantId !== params.tenantId) throw new Error("Forbidden");

  const inst = await prisma.instance.findFirst({
    where: { id: params.instanceId, tenantId: params.tenantId },
    include: { template: true },
  });
  if (!inst) throw new Error("Not found");
  if (inst.assigneeId !== params.actorId) throw new Error("Forbidden");
  if (!["PENDING", "IN_PROGRESS"].includes(inst.status)) throw new Error("Read only");

  const doc = parseTemplateSchema(inst.template.schema);
  const slot = doc.fileSlots?.find((s) => s.key === params.slotKey);
  if (!slot) throw new Error("Unknown file slot");

  const maxBytes = slot.maxSizeMB * 1024 * 1024;
  if (params.buffer.length > maxBytes) throw new Error("File too large");

  const ext = params.extension.toLowerCase().replace(/^\./, "");
  if (!slot.extensions.map((e) => e.toLowerCase().replace(/^\./, "")).includes(ext)) {
    throw new Error("Invalid file type");
  }

  const serverHash = await sha256Buffer(params.buffer);
  if (serverHash !== params.clientHash) throw new Error("Hash mismatch");

  const { relativePath } = await storage.saveFile({
    tenantId: params.tenantId,
    instanceId: params.instanceId,
    originalName: params.originalName,
    buffer: params.buffer,
  });

  await prisma.instanceFile.deleteMany({
    where: { instanceId: inst.id, slotKey: params.slotKey },
  });

  const row = await prisma.instanceFile.create({
    data: {
      tenantId: params.tenantId,
      instanceId: inst.id,
      slotKey: params.slotKey,
      fileName: params.originalName,
      fileExtension: ext,
      fileSize: params.buffer.length,
      clientHash: params.clientHash,
      serverHash,
      storagePath: relativePath,
    },
  });

  await prisma.instance.update({
    where: { id: inst.id },
    data: { status: "IN_PROGRESS" },
  });

  return row;
}

export async function reviewInstance(params: {
  tenantId: string;
  actorId: string;
  instanceId: string;
  status: Extract<InstanceStatus, "APPROVED" | "FLAGGED" | "REJECTED">;
  reviewNotes?: string;
}) {
  const user = await prisma.user.findUnique({ where: { id: params.actorId } });
  if (!user?.tenantId || user.tenantId !== params.tenantId) throw new Error("Forbidden");
  if (user.role !== "TENANT_ADMIN" && user.role !== "REVIEWER") throw new Error("Forbidden");

  const inst = await prisma.instance.findFirst({
    where: { id: params.instanceId, tenantId: params.tenantId },
  });
  if (!inst) throw new Error("Not found");
  if (inst.status !== "SUBMITTED") throw new Error("Nothing to review");

  await prisma.instance.update({
    where: { id: inst.id },
    data: {
      status: params.status,
      reviewNotes: params.reviewNotes ?? null,
      reviewedById: params.actorId,
      reviewedAt: new Date(),
    },
  });

  await writeAudit({
    tenantId: params.tenantId,
    actorId: params.actorId,
    action: "INSTANCE_REVIEWED",
    entityType: "Instance",
    entityId: inst.id,
    metadata: { status: params.status },
  });

  return { ok: true };
}
