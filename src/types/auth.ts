// Must match the backend exactly: role column in `users` table is
// "admin" | "doctor" | "receptionist" — nothing else.
// Patients never get a login account (see /book and the AI Agent instead).
// "pharmacy" was removed here on 2026-08 — the Pharmacy module was cut from
// scope by team decision; do not re-add it without checking with the team.
export type UserRole = "receptionist" | "doctor" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
