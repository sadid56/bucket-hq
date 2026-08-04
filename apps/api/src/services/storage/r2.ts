import { S3Adapter } from "./s3";

export class R2Adapter extends S3Adapter {
  constructor(config: {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
  }) {

    const endpoint = `https://${config.accountId}.r2.cloudflarestorage.com`;

    super({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      region: "auto",
      bucketName: config.bucketName,
      endpoint,
    });
  }
}
