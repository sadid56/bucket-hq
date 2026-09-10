import { useQuery, useMutation } from "@tanstack/react-query";
import { useAppMutation } from "@/hooks/useAppMutation";
import { ObjectEndpoints } from "./api";
import { objectsKeys } from "./keys";

export function useObjects({ connectionId, prefix }: { connectionId: string; prefix: string }) {
  return useQuery({
    queryKey: objectsKeys.lists(connectionId, prefix),
    queryFn: () => ObjectEndpoints.getObjects({ connectionId, prefix }),
    enabled: !!connectionId,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
}

export function useDeleteObject() {
  return useAppMutation<{ connectionId: string; key: string }>({
    mutationFn: ObjectEndpoints.deleteObject,
    invalidateKeys: [["objects"]],
    successMessage: "Object deleted successfully",
    errorMessage: "Failed to delete object",
  });
}

export function useGetSigningUrl() {
  return useMutation({
    mutationFn: ObjectEndpoints.getSigningUrl,
  });
}
