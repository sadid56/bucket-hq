import { useQuery } from "@tanstack/react-query";
import { useAppMutation } from "@/hooks/useAppMutation";
import { OrganizationEndpoints } from "./api";
import { organizationsKeys } from "./keys";

export function useOrgs(initialData?: any) {
  return useQuery({
    queryKey: organizationsKeys.lists(),
    queryFn: OrganizationEndpoints.getOrgs,
    initialData,
  });
}

export function useCreateOrg() {
  return useAppMutation<string>({
    mutationFn: OrganizationEndpoints.createOrg,
    invalidateKeys: [organizationsKeys.lists()],
    successMessage: "Organization created successfully",
    errorMessage: "Failed to create organization",
  });
}

export function useUpdateOrg() {
  return useAppMutation<{ orgId: string; name: string }>({
    mutationFn: OrganizationEndpoints.updateOrg,
    invalidateKeys: [organizationsKeys.lists()],
    successMessage: "Workspace renamed successfully",
    errorMessage: "Failed to rename workspace",
  });
}

export function useDeleteOrg() {
  return useAppMutation<string>({
    mutationFn: OrganizationEndpoints.deleteOrg,
    invalidateKeys: [organizationsKeys.lists()],
    successMessage: "Organization deleted successfully",
    errorMessage: "Failed to delete organization",
  });
}
