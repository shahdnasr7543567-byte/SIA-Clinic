import { useQuery } from "@tanstack/react-query";
import type { ReceptionStats, QueueEntry } from "@/types/patient";

// TODO(step: backend integration): replace with axios calls once the API is ready.
// Keeping these as React Query hooks now means every page below already has
// its loading/error states wired correctly — swapping the fetcher body is
// the only change needed later.

async function fetchReceptionStats(): Promise<ReceptionStats> {
  return { totalPatients: 0, waiting: 0, done: 0, revenue: 0 };
}

async function fetchQueue(): Promise<QueueEntry[]> {
  return [];
}

export function useReceptionStats() {
  return useQuery({ queryKey: ["reception", "stats"], queryFn: fetchReceptionStats });
}

export function useQueue() {
  return useQuery({
    queryKey: ["reception", "queue"],
    queryFn: fetchQueue,
    staleTime: 10_000, // the waiting-room queue changes constantly, unlike most other data
    refetchInterval: 15_000,
  });
}
