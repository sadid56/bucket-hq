export const objectsKeys = {
  all: ["objects"] as const,
  lists: (connectionId: string, prefix: string) => [...objectsKeys.all, "list", { connectionId, prefix }] as const,
};
