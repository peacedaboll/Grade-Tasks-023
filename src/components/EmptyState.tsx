import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  icon?: string;
}

export function EmptyState({ title, subtitle, children, icon = '📄' }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      {subtitle && <p>{subtitle}</p>}
      {children && <div className="empty-actions">{children}</div>}
    </div>
  );
}