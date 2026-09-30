export interface SessionUser {
  id: string;
  email: string;
  role: string;
}

export interface SessionTenant {
  id: string;
  name: string;
}

export interface StoredSession {
  user: SessionUser;
  tenant: SessionTenant;
}

const STORAGE_KEY = "ingoga_session";

export function getSession(): StoredSession | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export function setSession(session: StoredSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}
