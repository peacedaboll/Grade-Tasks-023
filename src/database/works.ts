import type { GradeWork } from '../types';
import * as db from './db';
import { uid } from '../utils/id';

export async function getWorksBySubject(subjectId: string): Promise<GradeWork[]> {
  const list = await db.getAllByIndex<GradeWork>('works', 'by_subject', subjectId);
  return list.sort((a, b) => {
    if (a.createdAt === b.createdAt) return a.id < b.id ? -1 : 1;
    return a.createdAt < b.createdAt ? -1 : 1;
  });
}

export async function countWorks(): Promise<number> {
  return db.count('works');
}

export async function addWork(
  data: Pick<
    GradeWork,
    'subjectId' | 'title' | 'description' | 'date' | 'deadline' | 'maxGrade' | 'materialId'
  >
): Promise<string> {
  const id = uid('work');
  const work: GradeWork = {
    id,
    subjectId: data.subjectId,
    title: data.title,
    description: data.description ?? '',
    date: data.date ?? '',
    deadline: data.deadline ?? '',
    maxGrade: data.maxGrade ?? 5,
    materialId: data.materialId,
    createdAt: new Date().toISOString()
  };
  await db.put('works', work);
  return id;
}

export async function updateWork(data: GradeWork): Promise<void> {
  await db.put('works', data);
}

export async function deleteWork(id: string): Promise<void> {
  await db.deleteAllByIndex('grades', 'by_work', id);
  await db.del('works', id);
}