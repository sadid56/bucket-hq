export const connectionsKeys = {
  all: ["connections"] as const,
  lists: (orgId?: string) => (orgId ? [...connectionsKeys.all, "list", orgId] as const : [...connectionsKeys.all, "list"] as const),
};
