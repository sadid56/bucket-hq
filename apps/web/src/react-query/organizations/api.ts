import { api } from "@/lib/api";

export const OrganizationEndpoints = {
  getOrgs: () => api<any[]>("/organizations"),

  createOrg: (name: string) =>
    api<any>("/organizations", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  updateOrg: ({ orgId, name }: { orgId: string; name: string }) =>
    api<any>(`/organizations/${orgId}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    }),

  deleteOrg: (orgId: string) =>
    api<void>(`/organizations/${orgId}`, {
      method: "DELETE",
    }),
};
