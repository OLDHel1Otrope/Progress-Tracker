import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteGoalApi } from "@/lib/api/goals"; // adjust path

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dayGoalId: string) => deleteGoalApi(dayGoalId),

    onSuccess: () => {
      // Refetch all goal-related queries
      queryClient.invalidateQueries({
        queryKey: ["goals"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dayGoals"],
      });
    },

    onError: (error) => {
      console.error("Delete failed:", error);
    },
  });
}
