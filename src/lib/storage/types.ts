export interface StorageProvider {
  /**
   * Save a file and return the path/key used to reference it later.
   */
  saveFile(params: {
    tenantId: string;
    instanceId: string;
    originalName: string;
    buffer: Buffer;
  }): Promise<{ relativePath: string; storagePath: string }>;

  /**
   * Return a URL or signed URL for downloading a stored file.
   * `storagePath` is whatever was returned by saveFile.
   */
  getDownloadUrl(storagePath: string, expiresInSeconds?: number): Promise<string>;

  /**
   * Delete a stored file.
   */
  deleteFile(storagePath: string): Promise<void>;
}
