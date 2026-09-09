import { client } from "@/lib/orpc";

export const TeamEndpoints = {
  getMembers: (input?: { orgId?: string }) => client.team.listMembers(input),

  inviteMember: (body: {
    email: string;
    role: "OWNER" | "EDITOR" | "VIEWER";
  }) => client.team.inviteMember(body),

  updateMemberRole: ({
    userId,
    role,
  }: {
    userId: string;
    role: "OWNER" | "EDITOR" | "VIEWER";
  }) => client.team.updateMemberRole({ userId, role }),

  removeMember: (userId: string) => client.team.removeMember({ userId }),

  getPathRestrictions: ({
    userId,
    connectionId,
  }: {
    userId: string;
    connectionId: string;
  }) => client.team.listPathRestrictions({ userId, connectionId }),

  addPathRestriction: ({
    userId,
    storageConnectionId,
    pathPrefix,
    accessLevel,
  }: {
    userId: string;
    storageConnectionId: string;
    pathPrefix: string;
    accessLevel: "READ" | "WRITE" | "READ_WRITE" | string;
  }) =>
    client.team.addPathRestriction({
      userId,
      storageConnectionId,
      pathPrefix,
      accessLevel: accessLevel as any,
    }),

  removePathRestriction: (restrictionId: string) =>
    client.team.removePathRestriction({ restrictionId }),
};
