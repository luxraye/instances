import { mkdir, writeFile } from "fs/promises";
import path from "node:path";
import type { StorageProvider } from "./types";

const root = process.env.UPLOAD_DIR ?? `${process.cwd()}/uploads`;

export const localStorageProvider: StorageProvider = {
  async saveFile({ tenantId, instanceId, originalName, buffer }) {
    const safe = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const dir = path.join(root, tenantId, instanceId);
    await mkdir(dir, { recursive: true });
    const filename = `${Date.now()}_${safe}`;
    const relativePath = path.join(tenantId, instanceId, filename);
    const full = path.join(dir, filename);
    await writeFile(full, buffer);
    return { storagePath: full, relativePath };
  },

  async getDownloadUrl(storagePath) {
    // In local dev, files are served from the local filesystem.
    // Wire up a /api/files/[...path] route or similar to serve them.
    return `/api/v1/files?path=${encodeURIComponent(storagePath)}`;
  },

  async deleteFile(_storagePath) {
    // TODO: implement local file deletion
  },
};

/** @deprecated Use localStorageProvider directly */
export async function saveLocalFile(
  tenantId: string,
  instanceId: string,
  originalName: string,
  buffer: Buffer,
): Promise<{ storagePath: string; relativePath: string }> {
  return localStorageProvider.saveFile({ tenantId, instanceId, originalName, buffer });
}

export function getUploadRoot(): string {
  return root;
}
