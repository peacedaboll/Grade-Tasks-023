export type Role = 'admin';

export type Theme = 'light' | 'dark';

export interface Student {
  id: string;
  number: number;
  fullName: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  shortInfo: string;
}

export interface GradeWork {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  date: string;
  deadline: string;
  maxGrade: number;
  materialId?: string;
  createdAt: string;
}

export interface Grade {
  id: string;
  subjectId: string;
  workId: string;
  studentId: string;
  value: number | null;
}

export interface Material {
  id: string;
  subjectId: string;
  name: string;
  description: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  blob: Blob;
  createdAt: string;
}

export interface SettingsRecord {
  key: string;
  value: unknown;
}

export interface DashboardCounts {
  students: number;
  subjects: number;
  works: number;
  materials: number;
}