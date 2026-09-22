import { useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';

export type RouteName = 'home' | 'subject' | 'admin-login' | 'admin-dashboard';

export interface Route {
  name: RouteName;
  params: { id?: string };
}

function parseHash(): Route {
  const h = window.location.hash.replace(/^#/, '') || '/';
  const parts = h.split('?')[0].split('/').filter(Boolean);
  if (parts.length === 0) return { name: 'home', params: {} };
  if (parts[0] === 'subject' && parts[1]) {
    return { name: 'subject', params: { id: decodeURIComponent(parts[1]) } };
  }
  if (parts[0] === 'admin') {
    if (parts[1] === 'login') return { name: 'admin-login', params: {} };
    return { name: 'admin-dashboard', params: {} };
  }
  return { name: 'home', params: {} };
}

const HOME_ROUTE: Route = { name: 'home', params: {} };

let cachedRoute: Route = HOME_ROUTE;

function getSnapshot(): Route {
  return cachedRoute;
}

function refreshAndNotify(cb: () => void) {
  cachedRoute = parseHash();
  cb();
}

function subscribe(cb: () => void): () => void {
  const handler = () => refreshAndNotify(cb);
  window.addEventListener('hashchange', handler);
  return () => window.removeEventListener('hashchange', handler);
}

function initRoute(): void {
  if (typeof window !== 'undefined') {
    cachedRoute = parseHash();
  }
}

export function useRoute(): Route {
  return useSyncExternalStore(subscribe, getSnapshot, () => HOME_ROUTE);
}

export function navigate(path: string): void {
  window.location.hash = path;
}

interface LinkProps {
  to: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}

export function Link({ to, className, children, ariaLabel }: LinkProps) {
  return (
    <a className={className} href={`#${to}`} aria-label={ariaLabel}>
      {children}
    </a>
  );
}

initRoute();