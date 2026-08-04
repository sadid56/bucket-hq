import { api } from "@/lib/api";

export const UserEndpoints = {
  getUsers: ({ search }: { search: string }) => {
    const params = new URLSearchParams();
    if (search) {
      params.append("search", search);
    }
    return api<any[]>(`/users?${params.toString()}`);
  },

  getUser: (id: string) => api<any>(`/users/${id}`),

  getMe: () => api<any>("/users/me"),

  toggleBanUser: ({ userId, banned, reason }: { userId: string; banned: boolean; reason?: string }) =>
    api<any>(`/users/${userId}/ban`, {
      method: "PATCH",
      body: JSON.stringify({ banned, reason }),
    }),

  updateGlobalRole: ({ userId, role }: { userId: string; role: "ADMIN" | "MEMBER" }) =>
    api<any>(`/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),

  deleteUser: (id: string) => api<void>(`/users/${id}`, { method: "DELETE" }),
};
