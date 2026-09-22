import type { Grade } from '../types';
import * as db from './db';
import { uid } from '../utils/id';

export async function getGradesBySubject(subjectId: string): Promise<Grade[]> {
  return db.getAllByIndex<Grade>('grades', 'by_subject', subjectId);
}

export async function addGrade(
  data: Pick<Grade, 'subjectId' | 'workId' | 'studentId' | 'value'>
): Promise<string> {
  const id = uid('grade');
  const grade: Grade = { id, ...data };
  await db.put('grades', grade);
  return id;
}

export async function updateGradeValue(id: string, value: number | null): Promise<void> {
  const existing = await db.get<Grade>('grades', id);
  if (!existing) return;
  const updated: Grade = { ...existing, value };
  await db.put('grades', updated);
}

export async function deleteGrade(id: string): Promise<void> {
  await db.del('grades', id);
}