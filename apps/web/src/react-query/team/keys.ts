export const teamKeys = {
  all: ["team"] as const,
  lists: () => [...teamKeys.all, "list"] as const,
  restrictions: (userId: string, connectionId: string) => [...teamKeys.all, "restrictions", userId, connectionId] as const,
};
