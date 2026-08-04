import { v2 as cloudinary } from "cloudinary";
import { StorageAdapter, ListResult, StorageItem } from "./adapter";

export class CloudinaryAdapter implements StorageAdapter {
  private cloudName: string;
  private apiKey: string;
  private apiSecret: string;

  constructor(config: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  }) {
    this.cloudName = config.cloudName;
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;

    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
      secure: true,
    });
  }

  async listObjects(prefix: string = ""): Promise<ListResult> {
    const items: StorageItem[] = [];
    const commonPrefixes: string[] = [];

    let cleanPrefix = prefix.replace(/^\//, "");
    if (cleanPrefix && !cleanPrefix.endsWith("/")) {
      cleanPrefix += "/";
    }

    try {
      let foldersResponse;
      if (!cleanPrefix) {
        foldersResponse = await cloudinary.api.root_folders();
      } else {
        const parentFolder = cleanPrefix.slice(0, -1);
        foldersResponse = await cloudinary.api.sub_folders(parentFolder);
      }

      if (foldersResponse.folders) {
        for (const folder of foldersResponse.folders) {
          const folderPath = cleanPrefix ? `${cleanPrefix}${folder.name}/` : `${folder.name}/`;
          commonPrefixes.push(folderPath);
          items.push({
            key: folderPath,
            name: folder.name,
            size: 0,
            type: "folder",
          });
        }
      }

      const resourcesResponse = await cloudinary.api.resources({
        type: "upload",
        prefix: cleanPrefix,
        max_results: 100,
      });

      if (resourcesResponse.resources) {
        for (const res of resourcesResponse.resources) {
          const relativePath = cleanPrefix ? res.public_id.slice(cleanPrefix.length) : res.public_id;

          if (!relativePath.includes("/")) {

            const fileKey = `${res.public_id}.${res.format}`;
            items.push({
              key: fileKey,
              name: `${relativePath}.${res.format}`,
              size: res.bytes || 0,
              lastModified: new Date(res.created_at),
              type: "file",
            });
          }
        }
      }

      return {
        items,
        commonPrefixes,
      };
    } catch (error: any) {
      if (error?.error?.http_code === 404) {
        return { items: [], commonPrefixes: [] };
      }
      throw error;
    }
  }

  async generateUploadUrl(key: string, ttlSeconds: number = 900): Promise<string> {
    const timestamp = Math.round(new Date().getTime() / 1000);

    const lastSlashIndex = key.lastIndexOf("/");
    const folder = lastSlashIndex !== -1 ? key.slice(0, lastSlashIndex) : "";
    const filename = lastSlashIndex !== -1 ? key.slice(lastSlashIndex + 1) : key;

    const publicId = filename.replace(/\.[^/.]+$/, "");

    const paramsToSign: any = {
      timestamp,
      public_id: publicId,
    };

    if (folder) {
      paramsToSign.folder = folder;
    }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      this.apiSecret
    );

    let uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/auto/upload` +
      `?api_key=${this.apiKey}` +
      `&timestamp=${timestamp}` +
      `&public_id=${encodeURIComponent(publicId)}` +
      `&signature=${signature}`;

    if (folder) {
      uploadUrl += `&folder=${encodeURIComponent(folder)}`;
    }

    return uploadUrl;
  }

  async generateDownloadUrl(key: string, ttlSeconds: number = 900): Promise<string> {

    const lastDotIndex = key.lastIndexOf(".");
    const publicId = lastDotIndex !== -1 ? key.slice(0, lastDotIndex) : key;

    return cloudinary.url(publicId, {
      secure: true,
      sign_url: true,
      expires_at: Math.round(Date.now() / 1000) + ttlSeconds,
    });
  }

  async deleteObject(key: string): Promise<void> {

    const lastDotIndex = key.lastIndexOf(".");
    const publicId = lastDotIndex !== -1 ? key.slice(0, lastDotIndex) : key;

    await cloudinary.api.delete_resources([publicId], {
      all: true,
    });
  }
}
