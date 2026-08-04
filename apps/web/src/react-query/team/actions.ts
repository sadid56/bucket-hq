import { useQuery } from "@tanstack/react-query";
import { useAppMutation } from "@/hooks/useAppMutation";
import { TeamEndpoints } from "./api";
import { teamKeys } from "./keys";

export function useMembers() {
  return useQuery({
    queryKey: teamKeys.lists(),
    queryFn: TeamEndpoints.getMembers,
  });
}

export function useInviteMember() {
  return useAppMutation<{ email: string; role: "OWNER" | "EDITOR" | "VIEWER" }>({
    mutationFn: TeamEndpoints.inviteMember,
    invalidateKeys: [teamKeys.lists()],
    successMessage: "Member invited successfully",
    errorMessage: "Failed to invite member",
  });
}

export function useUpdateMemberRole() {
  return useAppMutation<{ userId: string; role: "OWNER" | "EDITOR" | "VIEWER" }>({
    mutationFn: TeamEndpoints.updateMemberRole,
    invalidateKeys: [teamKeys.lists()],
    successMessage: "Role updated successfully",
    errorMessage: "Failed to update role",
  });
}

export function useRemoveMember() {
  return useAppMutation<string>({
    mutationFn: TeamEndpoints.removeMember,
    invalidateKeys: [teamKeys.lists()],
    successMessage: "Member removed successfully",
    errorMessage: "Failed to remove member",
  });
}

export function usePathRestrictions({ userId, connectionId }: { userId: string; connectionId: string }) {
  return useQuery({
    queryKey: teamKeys.restrictions(userId, connectionId),
    queryFn: () => TeamEndpoints.getPathRestrictions({ userId, connectionId }),
    enabled: !!userId && !!connectionId,
  });
}

export function useAddPathRestriction(userId: string) {
  return useAppMutation<{ storageConnectionId: string; pathPrefix: string; accessLevel: string }>({
    mutationFn: (body) => TeamEndpoints.addPathRestriction({ userId, ...body }),
    invalidateKeys: [["team"]],
    successMessage: "Path access rule configured successfully",
    errorMessage: "Failed to add path rule",
  });
}

export function useRemovePathRestriction() {
  return useAppMutation<string>({
    mutationFn: TeamEndpoints.removePathRestriction,
    invalidateKeys: [["team"]],
    successMessage: "Path rule removed successfully",
    errorMessage: "Failed to remove path rule",
  });
}
