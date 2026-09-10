import { StorageConnection } from "@/server/db";
import { decrypt } from "../../utils/encryption";
import { S3Adapter } from "./s3";
import { R2Adapter } from "./r2";
import { CloudinaryAdapter } from "./cloudinary";
import { StorageAdapter } from "./adapter";

export * from "./adapter";
export * from "./s3";
export * from "./r2";
export * from "./cloudinary";

interface CachedAdapter {
  adapter: StorageAdapter;
  updatedAt: string;
}

const adapterCache = new Map<string, CachedAdapter>();

export function getStorageClient(connection: StorageConnection): StorageAdapter {
  const cacheKey = connection.id;
  const updatedKey = connection.updatedAt.toISOString();

  const cached = adapterCache.get(cacheKey);
  if (cached && cached.updatedAt === updatedKey) {
    return cached.adapter;
  }

  const credsPlaintext = decrypt(
    connection.encryptedCreds,
    connection.iv,
    connection.authTag
  );

  const creds = JSON.parse(credsPlaintext);
  let adapter: StorageAdapter;

  switch (connection.providerType) {
    case "AWS_S3":
      if (!creds.accessKeyId || !creds.secretAccessKey || !connection.bucketName) {
        throw new Error("Invalid S3 connection credentials");
      }
      adapter = new S3Adapter({
        accessKeyId: creds.accessKeyId,
        secretAccessKey: creds.secretAccessKey,
        region: connection.region || "us-east-1",
        bucketName: connection.bucketName,
      });
      break;

    case "CLOUDFLARE_R2":
      if (!creds.accountId || !creds.accessKeyId || !creds.secretAccessKey || !connection.bucketName) {
        throw new Error("Invalid R2 connection credentials");
      }
      adapter = new R2Adapter({
        accountId: creds.accountId,
        accessKeyId: creds.accessKeyId,
        secretAccessKey: creds.secretAccessKey,
        bucketName: connection.bucketName,
      });
      break;

    case "CLOUDINARY":
      if (!creds.cloudName || !creds.apiKey || !creds.apiSecret) {
        throw new Error("Invalid Cloudinary connection credentials");
      }
      adapter = new CloudinaryAdapter({
        cloudName: creds.cloudName,
        apiKey: creds.apiKey,
        apiSecret: creds.apiSecret,
      });
      break;

    default:
      throw new Error(`Unsupported storage connection type: ${connection.providerType}`);
  }

  adapterCache.set(cacheKey, {
    adapter,
    updatedAt: updatedKey,
  });

  return adapter;
}
