import { client } from "@/lib/orpc";

export const AuditEndpoints = {
  getAudits: (filters: {
    action?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }) => client.audit.list(filters),

  getStats: () => client.audit.getStats(),
};
