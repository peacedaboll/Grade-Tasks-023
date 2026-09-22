import type { DashboardCounts } from '../types';
import { countStudents } from '../database/students';
import { countSubjects } from '../database/subjects';
import { countWorks } from '../database/works';
import { countMaterials } from '../database/materials';

export async function getDashboardCounts(): Promise<DashboardCounts> {
  const [students, subjects, works, materials] = await Promise.all([
    countStudents(),
    countSubjects(),
    countWorks(),
    countMaterials()
  ]);
  return { students, subjects, works, materials };
}

export function averageGrades(values: (number | null)[]): number | null {
  const nums = values.filter((v): v is number => typeof v === 'number' && v !== null);
  if (nums.length === 0) return null;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

export function gradeColor(value: number): string {
  if (value >= 5) return 'grade-5';
  if (value >= 4) return 'grade-4';
  if (value >= 3) return 'grade-3';
  return 'grade-2';
}