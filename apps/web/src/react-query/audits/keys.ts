export const auditsKeys = {
  all: ["audits"] as const,
  lists: (filters: any) => [...auditsKeys.all, "list", filters] as const,
  stats: () => [...auditsKeys.all, "stats"] as const,
};
