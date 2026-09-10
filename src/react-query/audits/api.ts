import { client } from "@/lib/orpc";

export const AuditEndpoints = {
  getAudits: (filters?: {
    orgId?: string;
    action?: string;
    userId?: string;
    storageConnectionId?: string;
    startDate?: string;
    endDate?: string;
  }) => client.audit.list(filters),

  getStats: () => client.audit.getStats(),
};
