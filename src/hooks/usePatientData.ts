import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientApi } from "@/api/endpoints/patient.api";
import type { ReminderPreset } from "@/types/patientProfile";

export function usePatientSearch(query: string) {
  return useQuery({
    queryKey: ["patients", "search", query],
    queryFn: () => patientApi.search(query),
    enabled: query.trim().length > 0,
    staleTime: 15_000,
  });
}

export function usePatientProfile(id: string) {
  return useQuery({ queryKey: ["patients", id], queryFn: () => patientApi.getById(id) });
}

export function usePatientMedicalInfo(id: string) {
  return useQuery({ queryKey: ["patients", id, "medical"], queryFn: () => patientApi.getMedicalInfo(id) });
}

export function usePatientStats(id: string) {
  return useQuery({ queryKey: ["patients", id, "stats"], queryFn: () => patientApi.getStats(id) });
}

export function usePrescriptionHistory(id: string) {
  return useQuery({ queryKey: ["patients", id, "history"], queryFn: () => patientApi.getPrescriptionHistory(id) });
}

export function useReminders(id: string) {
  return useQuery({ queryKey: ["patients", id, "reminders"], queryFn: () => patientApi.getReminders(id) });
}

export function useCreateReminder(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ preset, date }: { preset: ReminderPreset; date: string }) =>
      patientApi.createReminder(patientId, preset, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients", patientId, "reminders"] });
    },
  });
} 