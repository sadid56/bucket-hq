import { api } from "@/lib/api";

export const ObjectEndpoints = {
  getObjects: ({ connectionId, prefix }: { connectionId: string; prefix: string }) => {
    const params = new URLSearchParams({ connectionId, prefix });
    return api<{ items: any[] }>(`/objects?${params.toString()}`);
  },

  deleteObject: ({ connectionId, key }: { connectionId: string; key: string }) =>
    api<void>("/objects", {
      method: "DELETE",
      body: JSON.stringify({ connectionId, key }),
    }),

  getSigningUrl: ({ action, connectionId, key }: { action: "upload" | "download"; connectionId: string; key: string }) =>
    api<{ url: string }>(`/signing/${action}`, {
      method: "POST",
      body: JSON.stringify({ connectionId, key }),
    }),
};
