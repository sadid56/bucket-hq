import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toaster } from "@/components/ui/toaster";

type MutationOptions<TData> = {
  mutationFn: (data: TData) => Promise<any>;
  invalidateKeys?: readonly (readonly unknown[])[];
  successMessage?: string;
  errorMessage?: string;
};

export function useAppMutation<TData>({ mutationFn, invalidateKeys = [], successMessage, errorMessage }: MutationOptions<TData>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });

      if (successMessage) {
        toaster.create({
          title: successMessage,
          type: "success",
        });
      }
    },
    onError: (error: any) => {
      toaster.create({
        title: error?.response?.data?.message || errorMessage || "Something went wrong",
        type: "error",
      });
    },
  });
}
