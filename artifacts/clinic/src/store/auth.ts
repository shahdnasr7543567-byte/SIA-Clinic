export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'admin'|'doctor'|'receptionist'|'patient';
  mobile?: string | null;
  specialty?: string | null;
}

export function getStoredUser(): AuthUser | null {
  try { 
    return JSON.parse(localStorage.getItem('sia_user') || 'null'); 
  } catch { 
    return null; 
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem('sia_token');
}

export function storeAuth(token: string, user: AuthUser) {
  localStorage.setItem('sia_token', token);
  localStorage.setItem('sia_user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('sia_token');
  localStorage.removeItem('sia_user');
}
