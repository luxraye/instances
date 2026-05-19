import { createHash } from "crypto";

export async function sha256Buffer(buf: Buffer): Promise<string> {
  return createHash("sha256").update(buf).digest("hex");
}

export async function sha256WebCrypto(data: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", data);
  return bufferToHex(hash);
}

function bufferToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
