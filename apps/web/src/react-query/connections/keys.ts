export const connectionsKeys = {
  all: ["connections"] as const,
  lists: () => [...connectionsKeys.all, "list"] as const,
};
