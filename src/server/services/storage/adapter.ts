export interface StorageItem {
  key: string;
  name: string;
  size: number;
  lastModified?: Date;
  type: "file" | "folder";
}

export interface ListResult {
  items: StorageItem[];
  commonPrefixes: string[];
}

export interface StorageAdapter {

  listObjects(prefix?: string): Promise<ListResult>;
  generateUploadUrl(key: string, ttlSeconds?: number): Promise<string>;
  generateDownloadUrl(key: string, ttlSeconds?: number): Promise<string>;
  deleteObject(key: string): Promise<void>;
}
