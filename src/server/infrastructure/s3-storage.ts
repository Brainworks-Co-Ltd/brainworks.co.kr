import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import type { PrivateObjectStorage } from "@/server/modules/assets/storage-port";

export class S3ObjectStorage implements PrivateObjectStorage {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(options: { bucket: string; region: string; endpoint?: string }) {
    this.client = new S3Client({
      region: options.region,
      endpoint: options.endpoint,
    });
    this.bucket = options.bucket;
  }

  async put(key: string, body: Buffer, contentType: string) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  }

  async remove(key: string) {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}
