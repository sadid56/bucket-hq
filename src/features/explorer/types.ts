export interface StorageItem {
  key: string;
  name: string;
  size: number;
  lastModified?: string | Date;
  type: "file" | "folder";
}
