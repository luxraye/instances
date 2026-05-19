/**
 * S3-compatible storage provider scaffold.
 *
 * Supports AWS S3, Cloudflare R2, MinIO, or any S3-API-compatible store.
 *
 * Required env vars (set in .env.local for dev, platform secrets for prod):
 *   STORAGE_ENDPOINT   — e.g. https://<accountid>.r2.cloudflarestorage.com  (omit for AWS S3)
 *   STORAGE_REGION     — e.g. auto  (R2) or us-east-1  (S3)
 *   STORAGE_BUCKET     — bucket name
 *   STORAGE_ACCESS_KEY — access key id
 *   STORAGE_SECRET_KEY — secret access key
 *   STORAGE_PUBLIC_URL — optional public base URL for downloads (CDN / public bucket)
 *
 * Install the AWS SDK:
 *   yarn add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
 *
 * Then uncomment the code below and remove this comment block.
 */

import type { StorageProvider } from "./types";

// ---------------------------------------------------------------------------
// Uncomment after installing @aws-sdk/client-s3 + @aws-sdk/s3-request-presigner
// ---------------------------------------------------------------------------

// import {
//   S3Client,
//   PutObjectCommand,
//   DeleteObjectCommand,
//   GetObjectCommand,
// } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
//
// function getClient() {
//   return new S3Client({
//     region: process.env.STORAGE_REGION ?? "auto",
//     endpoint: process.env.STORAGE_ENDPOINT,
//     credentials: {
//       accessKeyId: process.env.STORAGE_ACCESS_KEY!,
//       secretAccessKey: process.env.STORAGE_SECRET_KEY!,
//     },
//   });
// }
//
// const bucket = () => process.env.STORAGE_BUCKET!;
//
// export const s3StorageProvider: StorageProvider = {
//   async saveFile({ tenantId, instanceId, originalName, buffer }) {
//     const safe = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
//     const key = `${tenantId}/${instanceId}/${Date.now()}_${safe}`;
//     const client = getClient();
//     await client.send(
//       new PutObjectCommand({
//         Bucket: bucket(),
//         Key: key,
//         Body: buffer,
//         ContentDisposition: `attachment; filename="${safe}"`,
//       }),
//     );
//     return { storagePath: key, relativePath: key };
//   },
//
//   async getDownloadUrl(storagePath, expiresInSeconds = 3600) {
//     if (process.env.STORAGE_PUBLIC_URL) {
//       return `${process.env.STORAGE_PUBLIC_URL.replace(/\/$/, "")}/${storagePath}`;
//     }
//     const client = getClient();
//     return getSignedUrl(
//       client,
//       new GetObjectCommand({ Bucket: bucket(), Key: storagePath }),
//       { expiresIn: expiresInSeconds },
//     );
//   },
//
//   async deleteFile(storagePath) {
//     const client = getClient();
//     await client.send(new DeleteObjectCommand({ Bucket: bucket(), Key: storagePath }));
//   },
// };

// ---------------------------------------------------------------------------
// Placeholder — remove once the above is uncommented
// ---------------------------------------------------------------------------
export const s3StorageProvider: StorageProvider = {
  saveFile: async () => {
    throw new Error("S3 storage provider is not configured. See src/lib/storage/s3.ts.");
  },
  getDownloadUrl: async () => {
    throw new Error("S3 storage provider is not configured. See src/lib/storage/s3.ts.");
  },
  deleteFile: async () => {
    throw new Error("S3 storage provider is not configured. See src/lib/storage/s3.ts.");
  },
};
