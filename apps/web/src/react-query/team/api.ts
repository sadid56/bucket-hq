import { api } from "@/lib/api";

export const TeamEndpoints = {
  getMembers: () => api<any[]>("/team"),

  inviteMember: (body: { email: string; role: "OWNER" | "EDITOR" | "VIEWER" }) =>
    api<any>("/team/invite", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateMemberRole: ({ userId, role }: { userId: string; role: "OWNER" | "EDITOR" | "VIEWER" }) =>
    api<any>(`/team/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    }),

  removeMember: (userId: string) =>
    api<void>(`/team/${userId}`, {
      method: "DELETE",
    }),

  getPathRestrictions: ({ userId, connectionId }: { userId: string; connectionId: string }) =>
    api<any[]>(`/team/restrictions/${userId}/${connectionId}`),

  addPathRestriction: ({ userId, storageConnectionId, pathPrefix, accessLevel }: { userId: string; storageConnectionId: string; pathPrefix: string; accessLevel: string }) =>
    api<any>(`/team/restrictions/${userId}`, {
      method: "POST",
      body: JSON.stringify({ storageConnectionId, pathPrefix, accessLevel }),
    }),

  removePathRestriction: (restrictionId: string) =>
    api<void>(`/team/restrictions/${restrictionId}`, {
      method: "DELETE",
    }),
};
