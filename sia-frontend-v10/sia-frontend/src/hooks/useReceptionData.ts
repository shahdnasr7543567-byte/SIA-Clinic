import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { receptionApi } from "@/api/endpoints/reception.api";
import type { QueueStatus } from "@/types/patient";

// Wired to the real backend now (was returning hardcoded empty mocks).
export function useReceptionStats() {
  return useQuery({ queryKey: ["reception", "stats"], queryFn: receptionApi.getStats });
}

export function useQueue() {
  return useQuery({
    queryKey: ["reception", "queue"],
    queryFn: receptionApi.getQueue,
    staleTime: 10_000, // the waiting-room queue changes constantly, unlike most other data
    refetchInterval: 15_000,
  });
}

export function useUpdateQueueStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entryId, status }: { entryId: string; status: QueueStatus }) =>
      receptionApi.updateQueueStatus(entryId, status),
    onSuccess: () => {
      // stats (waiting/done counts) change too whenever queue status changes
      queryClient.invalidateQueries({ queryKey: ["reception", "queue"] });
      queryClient.invalidateQueries({ queryKey: ["reception", "stats"] });
    },
    onError: () => {
      toast.error("حصل خطأ أثناء تحديث حالة المريض، حاول تاني");
    },
  });
} 