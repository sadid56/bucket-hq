export const objectsKeys = {
  all: ["objects"] as const,
  lists: (
    connectionId: string,
    prefix: string,
    continuationToken?: string,
    pageSize?: number
  ) =>
    [
      ...objectsKeys.all,
      "list",
      {
        connectionId,
        prefix,
        continuationToken: continuationToken || "",
        pageSize: pageSize || 25,
      },
    ] as const,
};
