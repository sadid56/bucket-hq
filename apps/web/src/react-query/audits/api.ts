import { api } from "@/lib/api";

export const AuditEndpoints = {
  getAudits: (filters: { action?: string; userId?: string; startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams();
    if (filters.action) params.append("action", filters.action);
    if (filters.userId) params.append("userId", filters.userId);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    return api<any[]>(`/audits?${params.toString()}`);
  },

  getStats: () => api<any>("/audits/stats"),
};
