import { useCallback, useEffect, useState } from 'react';
import type { Grade, GradeWork, Material, Subject } from '../types';
import { getSubject } from '../database/subjects';
import { getWorksBySubject } from '../database/works';
import { getGradesBySubject } from '../database/grades';
import { getMaterialsBySubject } from '../database/materials';

interface SubjectData {
  subject: Subject;
  works: GradeWork[];
  grades: Grade[];
  materials: Material[];
}

interface State {
  data: SubjectData | null;
  loading: boolean;
  error: string | null;
}

export function useSubjectData(subjectId: string | undefined) {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null });

  const load = useCallback(async () => {
    if (!subjectId) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const subject = await getSubject(subjectId);
      if (!subject) {
        setState({ data: null, loading: false, error: 'Предмет не найден' });
        return;
      }
      const [works, grades, materials] = await Promise.all([
        getWorksBySubject(subjectId),
        getGradesBySubject(subjectId),
        getMaterialsBySubject(subjectId)
      ]);
      setState({ data: { subject, works, grades, materials }, loading: false, error: null });
    } catch {
      setState({ data: null, loading: false, error: 'Не удалось загрузить данные предмета' });
    }
  }, [subjectId]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}