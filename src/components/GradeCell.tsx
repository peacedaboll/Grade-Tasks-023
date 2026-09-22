import { useState } from 'react';
import type { GradeWork, Student } from '../types';
import { gradeColor } from '../services/journal';

interface GradeCellProps {
  work: GradeWork;
  student: Student;
  value: number | null;
  admin: boolean;
  onSave: (value: number | null) => Promise<void> | void;
}

const OPTIONS = ['', '2', '3', '4', '5'];

export function GradeCell({ work, student, value, admin, onSave }: GradeCellProps) {
  const [saving, setSaving] = useState(false);

  if (!admin) {
    if (value === null) return <span className="grade-empty">—</span>;
    return <span className={`grade-chip ${gradeColor(value)}`}>{value}</span>;
  }

  const handleChange = async (raw: string) => {
    const next = raw === '' ? null : Number(raw);
    if (next !== null && ![2, 3, 4, 5].includes(next)) return;
    setSaving(true);
    try {
      await onSave(next);
    } finally {
      setSaving(false);
    }
  };

  return (
    <select
      className={`grade-select ${value !== null ? gradeColor(value) : ''}`}
      value={value === null ? '' : String(value)}
      onChange={(e) => handleChange(e.target.value)}
      disabled={saving}
      aria-label={`Оценка студента №${student.number} по работе «${work.title}»`}
      title={`Оценка: ${value ?? 'нет'}`}
    >
      {OPTIONS.map((o) => (
        <option key={o} value={o}>
          {o === '' ? '—' : o}
        </option>
      ))}
    </select>
  );
}