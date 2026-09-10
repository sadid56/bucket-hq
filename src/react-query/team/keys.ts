export const teamKeys = {
  all: ["team"] as const,
  lists: (orgId?: string) => (orgId ? [...teamKeys.all, "list", orgId] as const : [...teamKeys.all, "list"] as const),
  invitations: (orgId?: string) => (orgId ? [...teamKeys.all, "invitations", orgId] as const : [...teamKeys.all, "invitations"] as const),
  restrictions: (userId: string, connectionId: string) => [...teamKeys.all, "restrictions", userId, connectionId] as const,
};
