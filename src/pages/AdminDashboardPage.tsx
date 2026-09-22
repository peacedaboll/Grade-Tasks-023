import { useEffect, useState } from 'react';
import type { DashboardCounts, Subject } from '../types';
import { getDashboardCounts } from '../services/journal';
import { getSubjects } from '../database/subjects';
import { logout, useAuthRole } from '../services/auth';
import { useToast } from '../hooks/useToast';
import { Link, navigate } from '../utils/router';

export function AdminDashboardPage() {
  const role = useAuthRole();
  const { show } = useToast();
  const [counts, setCounts] = useState<DashboardCounts | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getDashboardCounts(), getSubjects()])
      .then(([c, s]) => {
        if (!cancelled) {
          setCounts(c);
          setSubjects(s);
        }
      })
      .catch(() => show('Не удалось загрузить данные панели', 'error'));
    return () => {
      cancelled = true;
    };
  }, [show]);

  if (role !== 'admin') {
    return (
      <div className="page-content narrow">
        <section className="auth-card">
          <h1>Требуется вход администратора</h1>
          <p className="muted">Доступ к этой странице есть только у администратора.</p>
          <button type="button" className="btn btn-primary btn-block" onClick={() => navigate('/admin/login')}>
            Войти как администратор
          </button>
        </section>
      </div>
    );
  }

  const stats = counts
    ? [
        { label: 'Студентов', value: counts.students },
        { label: 'Предметов', value: counts.subjects },
        { label: 'Заданий', value: counts.works },
        { label: 'Материалов', value: counts.materials }
      ]
    : [];

  return (
    <div className="page-content">
      <section className="section-head align-start">
        <div>
          <h1>Админ-панель</h1>
          <p className="muted">Управление журналом группы 023 ИСП</p>
        </div>
        <button type="button" className="btn btn-danger" onClick={() => logout()}>
          Выйти
        </button>
      </section>

      <div className="stat-grid">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <section>
        <div className="section-head">
          <h2>Предметы</h2>
          <span className="muted">Откройте предмет, чтобы управлять журналом</span>
        </div>
        <div className="admin-subject-list">
          {subjects.map((s) => (
            <Link key={s.id} to={`/subject/${encodeURIComponent(s.id)}`} className="admin-subject-row">
              <span className="subject-code">{s.code}</span>
              <span className="admin-subject-name">{s.name}</span>
              <span className="admin-subject-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}