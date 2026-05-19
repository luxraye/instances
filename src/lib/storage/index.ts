/**
 * Active storage provider.
 *
 * Set STORAGE_DRIVER=s3 in your environment to switch to S3-compatible storage.
 * Defaults to local filesystem storage (dev only).
 */
import { localStorageProvider } from "./local";
import { s3StorageProvider } from "./s3";
import type { StorageProvider } from "./types";

function resolveProvider(): StorageProvider {
  const driver = process.env.STORAGE_DRIVER ?? "local";
  if (driver === "s3") return s3StorageProvider;
  if (driver === "local") return localStorageProvider;
  throw new Error(`Unknown STORAGE_DRIVER "${driver}". Use "local" or "s3".`);
}

export const storage: StorageProvider = resolveProvider();
export type { StorageProvider };
