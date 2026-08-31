import { useQuery } from "@tanstack/react-query";
import { doctorApi } from "@/api/endpoints/doctor.api";

export function useDoctorStats() {
  return useQuery({ queryKey: ["doctor", "stats"], queryFn: doctorApi.getStats });
}

export function useDoctorQueue() {
  return useQuery({
    queryKey: ["doctor", "queue"],
    queryFn: doctorApi.getQueue,
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
} 