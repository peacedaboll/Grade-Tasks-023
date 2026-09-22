import { useEffect, useState } from 'react';
import type { Subject } from '../types';
import { getSubjects } from '../database/subjects';
import { useToast } from '../hooks/useToast';
import { SubjectCard } from '../components/SubjectCard';
import { EmptyState } from '../components/EmptyState';

export function HomePage() {
  const { show } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubjects()
      .then(setSubjects)
      .catch(() => show('Не удалось загрузить список предметов', 'error'))
      .finally(() => setLoading(false));
  }, [show]);

  return (
    <div className="page-content">
      <section className="hero">
        <span className="hero-badge">4 курс · группа 023 ИСП</span>
        <h1>Электронный журнал группы</h1>
        <p className="hero-info">
          09.02.07 Информационные системы и программирование · 4 курс · Группа 023 ИСП
        </p>
        <p className="hero-note">
          Вход как студент не требует авторизации — просто откройте предмет.
        </p>
      </section>

      <section className="subjects-section">
        <div className="section-head">
          <h2>Предметы</h2>
          {!loading && <span className="muted">Всего: {subjects.length}</span>}
        </div>

        {loading ? (
          <div className="spinner-wrap">
            <div className="spinner" />
          </div>
        ) : subjects.length === 0 ? (
          <EmptyState icon="📚" title="Предметы не найдены" />
        ) : (
          <div className="subject-grid">
            {subjects.map((s) => (
              <SubjectCard key={s.id} subject={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}