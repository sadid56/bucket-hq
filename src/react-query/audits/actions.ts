import { useQuery } from "@tanstack/react-query";
import { AuditEndpoints } from "./api";
import { auditsKeys } from "./keys";

export function useAudits(filters?: {
  orgId?: string;
  action?: string;
  userId?: string;
  storageConnectionId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: auditsKeys.lists(filters),
    queryFn: () => AuditEndpoints.getAudits(filters),
  });
}

export function useSystemStats() {
  return useQuery({
    queryKey: auditsKeys.stats(),
    queryFn: AuditEndpoints.getStats,
  });
}
