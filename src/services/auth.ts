import { useSyncExternalStore } from 'react';
import type { Role } from '../types';

const ADMIN_LOGIN = 'teacher';
const ADMIN_PASSWORD = 'teacher023';
const ROLE_KEY = 'ejournal_role';

export type RoleResult = { ok: true } | { ok: false; error: string };

function readRole(): Role | null {
  try {
    const r = sessionStorage.getItem(ROLE_KEY);
    return r === 'admin' ? 'admin' : null;
  } catch {
    return null;
  }
}

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function isAdmin(): boolean {
  return readRole() === 'admin';
}

export function useAuthRole(): Role | null {
  return useSyncExternalStore(subscribe, readRole, readRole);
}

export function loginAsAdmin(login: string, password: string): RoleResult {
  if (login !== ADMIN_LOGIN || password !== ADMIN_PASSWORD) {
    return { ok: false, error: 'Неверный логин или пароль' };
  }
  try {
    sessionStorage.setItem(ROLE_KEY, 'admin');
  } catch {
    return { ok: false, error: 'Не удалось сохранить сессию' };
  }
  emit();
  return { ok: true };
}

export function logout(): void {
  try {
    sessionStorage.removeItem(ROLE_KEY);
  } catch {
    /* ignore */
  }
  emit();
}