import { useEffect, useState } from 'react';
import type { Route } from '../utils/router';
import { Link } from '../utils/router';
import { useAuthRole } from '../services/auth';
import { useSubjectData } from '../hooks/useSubjectData';
import { Tabs } from '../components/Tabs';
import { EmptyState } from '../components/EmptyState';
import { JournalTab } from './tabs/JournalTab';
import { AssignmentsTab } from './tabs/AssignmentsTab';
import { MaterialsTab } from './tabs/MaterialsTab';

const TABS = [
  { id: 'journal', label: 'Журнал' },
  { id: 'assignments', label: 'Задания' },
  { id: 'materials', label: 'Материалы' }
];

export function SubjectPage({ route }: { route: Route }) {
  const role = useAuthRole();
  const admin = role === 'admin';
  const subjectId = route.params.id;
  const { data, loading, error, reload } = useSubjectData(subjectId);
  const [tab, setTab] = useState('journal');

  useEffect(() => {
    setTab('journal');
  }, [subjectId]);

  if (!subjectId) {
    return <EmptyState icon="⚠️" title="Предмет не указан" />;
  }

  return (
    <div className="page-content">
      <div className="breadcrumbs">
        <Link to="/" className="link-back">
          ← Все предметы
        </Link>
      </div>

      {loading ? (
        <div className="spinner-wrap">
          <div className="spinner" />
        </div>
      ) : error || !data ? (
        <EmptyState icon="⚠️" title={error ?? 'Произошла ошибка'} />
      ) : (
        <>
          <section className="subject-hero">
            <span className="subject-code">{data.subject.code}</span>
            <h1>{data.subject.name}</h1>
            {data.subject.shortInfo && <p className="muted">{data.subject.shortInfo}</p>}
          </section>

          <Tabs tabs={TABS} active={tab} onChange={setTab} />

          <div className="tab-body">
            {tab === 'journal' && (
              <JournalTab
                subjectId={data.subject.id}
                works={data.works}
                grades={data.grades}
                admin={admin}
                onChanged={reload}
              />
            )}
            {tab === 'assignments' && (
              <AssignmentsTab
                subjectId={data.subject.id}
                works={data.works}
                materials={data.materials}
                admin={admin}
                onChanged={reload}
              />
            )}
            {tab === 'materials' && (
              <MaterialsTab
                subjectId={data.subject.id}
                materials={data.materials}
                admin={admin}
                onChanged={reload}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}