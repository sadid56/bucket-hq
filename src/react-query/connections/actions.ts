import { useQuery } from "@tanstack/react-query";
import { useAppMutation } from "@/hooks/useAppMutation";
import { ConnectionEndpoints } from "./api";
import { connectionsKeys } from "./keys";

export function useConnections(orgId?: string, initialData?: any) {
  return useQuery({
    queryKey: connectionsKeys.lists(orgId),
    queryFn: () => ConnectionEndpoints.getConnections(orgId ? { orgId } : undefined),
    initialData,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateConnection() {
  return useAppMutation<any>({
    mutationFn: ConnectionEndpoints.createConnection,
    invalidateKeys: [connectionsKeys.lists()],
    successMessage: "Connection added successfully",
    errorMessage: "Failed to add connection",
  });
}

export function useUpdateConnection() {
  return useAppMutation<{ connectionId: string; [key: string]: any }>({
    mutationFn: ConnectionEndpoints.updateConnection,
    invalidateKeys: [connectionsKeys.lists()],
    successMessage: "Connection updated successfully",
    errorMessage: "Failed to update connection",
  });
}

export function useDeleteConnection() {
  return useAppMutation<string>({
    mutationFn: ConnectionEndpoints.deleteConnection,
    invalidateKeys: [connectionsKeys.lists()],
    successMessage: "Connection revoked successfully",
    errorMessage: "Failed to revoke connection",
  });
}
