import { useEffect, useMemo, useState } from 'react';
import type { Grade, GradeWork, Student } from '../../types';
import { getStudents } from '../../database/students';
import { addGrade, deleteGrade, updateGradeValue } from '../../database/grades';
import { deleteWork } from '../../database/works';
import { useToast } from '../../hooks/useToast';
import { averageGrades, gradeColor } from '../../services/journal';
import { formatDate } from '../../utils/dates';
import { GradeCell } from '../../components/GradeCell';
import { Modal } from '../../components/Modal';
import { EmptyState } from '../../components/EmptyState';
import { AddWorkForm } from '../../components/forms/AddWorkForm';

interface JournalTabProps {
  subjectId: string;
  works: GradeWork[];
  grades: Grade[];
  admin: boolean;
  onChanged: () => void;
}

interface GradeMapEntry {
  id: string;
  value: number | null;
}

function buildGradeMap(grades: Grade[]): Map<string, GradeMapEntry> {
  const map = new Map<string, GradeMapEntry>();
  for (const g of grades) {
    map.set(`${g.workId}|${g.studentId}`, { id: g.id, value: g.value });
  }
  return map;
}

export function JournalTab({ subjectId, works, grades, admin, onChanged }: JournalTabProps) {
  const { show } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [gradeMap, setGradeMap] = useState<Map<string, GradeMapEntry>>(buildGradeMap(grades));
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    getStudents()
      .then(setStudents)
      .catch(() => show('Не удалось загрузить список студентов', 'error'));
  }, [show]);

  useEffect(() => {
    setGradeMap(buildGradeMap(grades));
  }, [grades]);

  const handleSaveGrade = async (work: GradeWork, student: Student, value: number | null) => {
    const key = `${work.id}|${student.id}`;
    const existing = gradeMap.get(key);
    try {
      if (value === null) {
        if (existing) {
          await deleteGrade(existing.id);
          setGradeMap((m) => {
            const next = new Map(m);
            next.delete(key);
            return next;
          });
        }
      } else {
        if (existing) {
          await updateGradeValue(existing.id, value);
        } else {
          const id = await addGrade({ subjectId: work.subjectId, workId: work.id, studentId: student.id, value });
          setGradeMap((m) => new Map(m).set(key, { id, value }));
        }
      }
      show('Оценка сохранена', 'success');
    } catch {
      show('Не удалось сохранить оценку', 'error');
    }
  };

  const handleDeleteWork = async (work: GradeWork) => {
    if (!window.confirm(`Удалить работу «${work.title}» вместе с оценками?`)) return;
    try {
      await deleteWork(work.id);
      show('Работа удалена', 'success');
      onChanged();
    } catch {
      show('Не удалось удалить работу', 'error');
    }
  };

  const totalsByStudent = useMemo(() => {
    const totals = new Map<string, number | null>();
    for (const s of students) {
      const values = works.map((w) => gradeMap.get(`${w.id}|${s.id}`)?.value ?? null);
      totals.set(s.id, averageGrades(values));
    }
    return totals;
  }, [students, works, gradeMap]);

  if (works.length === 0) {
    return (
      <EmptyState
        icon="🗒"
        title="Работ ещё нет"
        subtitle="Создайте первую работу — она станет колонкой журнала и появится во вкладке «Задания»."
      >
        {admin && (
          <button type="button" className="btn btn-primary" onClick={() => setShowAdd(true)}>
            + Добавить работу
          </button>
        )}
        {showAdd && (
          <Modal title="Новая работа" onClose={() => setShowAdd(false)}>
            <AddWorkForm
              subjectId={subjectId}
              materials={[]}
              onSaved={() => {
                setShowAdd(false);
                onChanged();
              }}
              onCancel={() => setShowAdd(false)}
            />
          </Modal>
        )}
      </EmptyState>
    );
  }

  return (
    <section className="journal-section">
      <div className="section-head">
        <div>
          <h2>Журнал оценок</h2>
          <p className="muted">Работ: {works.length} · студентов: {students.length}</p>
        </div>
        {admin && (
          <button type="button" className="btn btn-primary" onClick={() => setShowAdd(true)}>
            + Добавить работу
          </button>
        )}
      </div>

      <div className="table-scroll">
        <table className="journal">
          <thead>
            <tr>
              <th className="sticky-cell sticky-first">№</th>
              <th className="sticky-cell">Студент</th>
              {works.map((w) => (
                <th key={w.id} className="work-col">
                  <div className="work-head">
                    <span className="work-title" title={w.title}>
                      {w.title}
                    </span>
                    {admin && (
                      <button
                        type="button"
                        className="btn-icon btn-icon-danger"
                        title="Удалить работу"
                        aria-label={`Удалить работу ${w.title}`}
                        onClick={() => handleDeleteWork(w)}
                      >
                        🗑
                      </button>
                    )}
                  </div>
                  <div className="work-date">
                    {formatDate(w.date)} {w.maxGrade !== 5 ? `· макс. ${w.maxGrade}` : ''}
                  </div>
                </th>
              ))}
              <th>Итоговая</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const total = totalsByStudent.get(s.id) ?? null;
              return (
                <tr key={s.id}>
                  <td className="sticky-cell sticky-first">{s.number}</td>
                  <td className="sticky-cell student-name">{s.fullName}</td>
                  {works.map((w) => {
                    const entry = gradeMap.get(`${w.id}|${s.id}`);
                    return (
                      <td key={w.id}>
                        <GradeCell
                          work={w}
                          student={s}
                          value={entry?.value ?? null}
                          admin={admin}
                          onSave={(v) => handleSaveGrade(w, s, v)}
                        />
                      </td>
                    );
                  })}
                  <td>
                    {total === null ? (
                      <span className="grade-empty">—</span>
                    ) : (
                      <span className={`grade-chip ${gradeColor(total)}`}>{total}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <Modal title="Новая работа" onClose={() => setShowAdd(false)}>
          <AddWorkForm
            subjectId={subjectId}
            materials={[]}
            onSaved={() => {
              setShowAdd(false);
              onChanged();
            }}
            onCancel={() => setShowAdd(false)}
          />
        </Modal>
      )}
    </section>
  );
}