import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function generateApiKey(): Promise<{ rawKey: string; prefix: string; keyHash: string }> {
  const rawKey = `inst_${crypto.randomBytes(32).toString("base64url")}`;
  const prefix = rawKey.slice(0, 12);
  const keyHash = await bcrypt.hash(rawKey, 10);
  return { rawKey, prefix, keyHash };
}
