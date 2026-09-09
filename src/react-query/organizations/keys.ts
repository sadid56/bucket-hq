export const organizationsKeys = {
  all: ["organizations"] as const,
  lists: () => [...organizationsKeys.all, "list"] as const,
};
