export interface StorageItem {
  key: string;
  name: string;
  size: number;
  lastModified?: Date;
  type: "file" | "folder";
}

export interface ListOptions {
  continuationToken?: string;
  maxKeys?: number;
}

export interface ListResult {
  items: StorageItem[];
  commonPrefixes: string[];
  nextContinuationToken?: string;
  isTruncated?: boolean;
}

export interface StorageAdapter {
  listObjects(prefix?: string, options?: ListOptions): Promise<ListResult>;
  generateUploadUrl(key: string, ttlSeconds?: number): Promise<string>;
  generateDownloadUrl(key: string, ttlSeconds?: number): Promise<string>;
  deleteObject(key: string): Promise<void>;
}
