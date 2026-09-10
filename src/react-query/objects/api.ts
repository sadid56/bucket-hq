import { client } from "@/lib/orpc";

export const ObjectEndpoints = {
  getObjects: ({
    connectionId,
    prefix,
    continuationToken,
    pageSize,
  }: {
    connectionId: string;
    prefix: string;
    continuationToken?: string;
    pageSize?: number;
  }) => client.object.list({ connectionId, prefix, continuationToken, pageSize }),

  deleteObject: ({
    connectionId,
    key,
  }: {
    connectionId: string;
    key: string;
  }) => client.object.delete({ connectionId, key }),

  getSigningUrl: ({
    action,
    connectionId,
    key,
  }: {
    action: "upload" | "download";
    connectionId: string;
    key: string;
  }) =>
    action === "upload"
      ? client.signing.getUploadUrl({ connectionId, key })
      : client.signing.getDownloadUrl({ connectionId, key }),
};
