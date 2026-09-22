import type { Subject } from '../types';
import * as db from './db';

export async function getSubjects(): Promise<Subject[]> {
  return db.getAll<Subject>('subjects');
}

export async function getSubject(id: string): Promise<Subject | undefined> {
  return db.get<Subject>('subjects', id);
}

export async function countSubjects(): Promise<number> {
  return db.count('subjects');
}