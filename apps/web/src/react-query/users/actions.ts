import { useQuery } from "@tanstack/react-query";
import { useAppMutation } from "@/hooks/useAppMutation";
import { UserEndpoints } from "./api";
import { usersKeys } from "./keys";

export function useUsers({ search = "" }) {
  return useQuery({
    queryKey: usersKeys.lists(search),
    queryFn: () => UserEndpoints.getUsers({ search }),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: () => UserEndpoints.getUser(id),
  });
}

export function useGetMe() {
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: UserEndpoints.getMe,
  });
}

export function useToggleBanUser() {
  return useAppMutation<{ userId: string; banned: boolean; reason?: string }>({
    mutationFn: UserEndpoints.toggleBanUser,
    invalidateKeys: [["users"]],
    successMessage: "User ban status updated successfully",
    errorMessage: "Failed to update ban status",
  });
}

export function useUpdateGlobalRole() {
  return useAppMutation<{ userId: string; role: "ADMIN" | "MEMBER" }>({
    mutationFn: UserEndpoints.updateGlobalRole,
    invalidateKeys: [["users"]],
    successMessage: "Global role updated successfully",
    errorMessage: "Failed to update global role",
  });
}

export function useDeleteUser() {
  return useAppMutation<string>({
    mutationFn: UserEndpoints.deleteUser,
    invalidateKeys: [["users"]],
    successMessage: "User deleted successfully",
    errorMessage: "Failed to delete user",
  });
}
