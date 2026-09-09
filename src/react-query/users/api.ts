import { client } from "@/lib/orpc";

export const UserEndpoints = {
  getUsers: ({ search }: { search: string }) => client.user.list({ search }),

  getUser: (id: string) => client.user.getUser({ id }),

  getMe: () => client.user.getMe(),

  updateMe: (data: { name?: string; image?: string }) =>
    client.user.updateProfile(data),

  toggleBanUser: ({
    userId,
    banned,
    reason,
  }: {
    userId: string;
    banned: boolean;
    reason?: string;
  }) => client.user.toggleBan({ userId, banned, reason }),

  updateGlobalRole: ({
    userId,
    role,
  }: {
    userId: string;
    role: "ADMIN" | "MEMBER";
  }) => client.user.updateRole({ userId, role }),

  deleteUser: (id: string) => client.user.delete({ id }),
};
