import { client } from "@/lib/orpc";

export const OrganizationEndpoints = {
  getOrgs: () => client.organization.list(),

  createOrg: (name: string) => client.organization.create({ name }),

  updateOrg: ({ orgId, name }: { orgId: string; name: string }) =>
    client.organization.update({ orgId, name }),

  deleteOrg: (orgId: string) => client.organization.delete({ orgId }),
};
