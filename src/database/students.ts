import type { Student } from '../types';
import * as db from './db';

export async function getStudents(): Promise<Student[]> {
  const list = await db.getAll<Student>('students');
  return list.sort((a, b) => a.number - b.number);
}

export async function countStudents(): Promise<number> {
  return db.count('students');
}