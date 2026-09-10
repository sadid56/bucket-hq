import {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { StorageAdapter, ListResult, StorageItem, ListOptions } from "./adapter";

export class S3Adapter implements StorageAdapter {
  protected client: S3Client;
  protected bucket: string;

  constructor(config: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucketName: string;
    endpoint?: string;
  }) {
    this.bucket = config.bucketName;
    this.client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      endpoint: config.endpoint,
      forcePathStyle: config.endpoint ? true : undefined,
    });
  }

  async listObjects(prefix: string = "", options?: ListOptions): Promise<ListResult> {
    const normalizedPrefix = prefix && !prefix.endsWith("/") ? `${prefix}/` : prefix;

    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: normalizedPrefix,
      Delimiter: "/",
      ContinuationToken: options?.continuationToken,
    });

    const response = await this.client.send(command);
    const items: StorageItem[] = [];
    const commonPrefixes: string[] = [];

    if (response.CommonPrefixes) {
      for (const p of response.CommonPrefixes) {
        if (p.Prefix) {
          commonPrefixes.push(p.Prefix);
          const parts = p.Prefix.split("/");
          const name = parts[parts.length - 2] || p.Prefix;
          items.push({
            key: p.Prefix,
            name,
            size: 0,
            type: "folder",
          });
        }
      }
    }

    if (response.Contents) {
      for (const file of response.Contents) {
        if (file.Key) {
          if (file.Key === normalizedPrefix) {
            continue;
          }
          const name = file.Key.split("/").pop() || file.Key;
          items.push({
            key: file.Key,
            name,
            size: file.Size || 0,
            lastModified: file.LastModified,
            type: "file",
          });
        }
      }
    }

    return {
      items,
      commonPrefixes,
      nextContinuationToken: response.NextContinuationToken,
      isTruncated: response.IsTruncated,
    };
  }

  async generateUploadUrl(key: string, ttlSeconds: number = 900): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn: ttlSeconds });
  }

  async generateDownloadUrl(key: string, ttlSeconds: number = 900): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn: ttlSeconds });
  }

  async deleteObject(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }
}
