import { useQuery } from "@tanstack/react-query";
import type { Patient } from "@/types/patient";
import type { PatientMedicalInfo, PatientStats, PrescriptionHistoryEntry, Reminder } from "@/types/patientProfile";

// TODO(step: backend integration): every function below becomes an axios call.
// The empty arrays/nulls are intentional per the brief (no seeded patient data).

async function searchPatients(query: string): Promise<Patient[]> {
  if (!query.trim()) return [];
  return [];
}

async function fetchPatientById(id: string): Promise<Patient | null> {
  void id;
  return null;
}

async function fetchPatientMedicalInfo(id: string): Promise<PatientMedicalInfo> {
  void id;
  return { chronicDiseases: [], allergies: [] };
}

async function fetchPatientStats(id: string): Promise<PatientStats> {
  void id;
  return { totalVisits: 0, firstVisit: null, lastVisit: null, topDiagnosis: null };
}

async function fetchPrescriptionHistory(id: string): Promise<PrescriptionHistoryEntry[]> {
  void id;
  return [];
}

async function fetchReminders(id: string): Promise<Reminder[]> {
  void id;
  return [];
}

export function usePatientSearch(query: string) {
  return useQuery({
    queryKey: ["patients", "search", query],
    queryFn: () => searchPatients(query),
    enabled: query.trim().length > 0,
    staleTime: 15_000,
  });
}

export function usePatientProfile(id: string) {
  return useQuery({ queryKey: ["patients", id], queryFn: () => fetchPatientById(id) });
}

export function usePatientMedicalInfo(id: string) {
  return useQuery({ queryKey: ["patients", id, "medical"], queryFn: () => fetchPatientMedicalInfo(id) });
}

export function usePatientStats(id: string) {
  return useQuery({ queryKey: ["patients", id, "stats"], queryFn: () => fetchPatientStats(id) });
}

export function usePrescriptionHistory(id: string) {
  return useQuery({ queryKey: ["patients", id, "history"], queryFn: () => fetchPrescriptionHistory(id) });
}

export function useReminders(id: string) {
  return useQuery({ queryKey: ["patients", id, "reminders"], queryFn: () => fetchReminders(id) });
}
