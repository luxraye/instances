import jwt from "jsonwebtoken";

export function signSubmissionReceipt(payload: {
  instanceId: string;
  tenantId: string;
  templateId: string;
  assigneeId: string;
  submittedAt: string;
}): string {
  const secret = process.env.SUBMISSION_JWT_SECRET;
  if (!secret) throw new Error("SUBMISSION_JWT_SECRET is not set");
  return jwt.sign(
    { ...payload, typ: "instances_submission" },
    secret,
    { algorithm: "HS256", expiresIn: "10y" },
  );
}
