import { api } from "@/lib/api";

export const ConnectionEndpoints = {
  getConnections: () => api<any[]>("/connections"),

  createConnection: (body: any) =>
    api<any>("/connections", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateConnection: ({ connectionId, ...body }: { connectionId: string; [key: string]: any }) =>
    api<any>(`/connections/${connectionId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  deleteConnection: (connectionId: string) =>
    api<void>(`/connections/${connectionId}`, {
      method: "DELETE",
    }),
};
