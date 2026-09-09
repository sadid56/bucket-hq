import { client } from "@/lib/orpc";

export const ConnectionEndpoints = {
  getConnections: (input?: { orgId?: string }) => client.connection.list(input),

  createConnection: (body: any) => client.connection.create(body),

  updateConnection: ({
    connectionId,
    ...body
  }: {
    connectionId: string;
    [key: string]: any;
  }) => client.connection.update({ connectionId, ...body }),

  deleteConnection: (connectionId: string) =>
    client.connection.delete({ connectionId }),
};
