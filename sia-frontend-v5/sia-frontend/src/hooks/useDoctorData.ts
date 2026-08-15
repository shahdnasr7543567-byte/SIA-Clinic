import { useQuery } from "@tanstack/react-query";

interface DoctorStats {
  patients: number;
  prescriptions: number;
  revenue: number;
}

// TODO(step: backend integration): swap for real axios calls.
async function fetchDoctorStats(): Promise<DoctorStats> {
  return { patients: 0, prescriptions: 0, revenue: 0 };
}

async function fetchDoctorQueue() {
  return [] as Array<{ id: string; name: string; mobile: string }>;
}

export function useDoctorStats() {
  return useQuery({ queryKey: ["doctor", "stats"], queryFn: fetchDoctorStats });
}

export function useDoctorQueue() {
  return useQuery({
    queryKey: ["doctor", "queue"],
    queryFn: fetchDoctorQueue,
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}
