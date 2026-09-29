export interface PrivateObjectStorage {
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  remove(key: string): Promise<void>;
  createSignedDownloadUrl?(key: string, expiresInSeconds: number): Promise<string>;
}
