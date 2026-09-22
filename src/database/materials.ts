import type { Material } from '../types';
import * as db from './db';
import { uid } from '../utils/id';

export async function getMaterialsBySubject(subjectId: string): Promise<Material[]> {
  const list = await db.getAllByIndex<Material>('materials', 'by_subject', subjectId);
  return list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function countMaterials(): Promise<number> {
  return db.count('materials');
}

export async function addMaterial(
  data: Pick<Material, 'subjectId' | 'name' | 'description' | 'fileName' | 'fileType' | 'fileSize' | 'blob'>
): Promise<string> {
  const id = uid('mat');
  const material: Material = {
    id,
    subjectId: data.subjectId,
    name: data.name,
    description: data.description ?? '',
    fileName: data.fileName,
    fileType: data.fileType,
    fileSize: data.fileSize,
    blob: data.blob,
    createdAt: new Date().toISOString()
  };
  await db.put('materials', material);
  return id;
}

export async function deleteMaterial(id: string): Promise<void> {
  await db.del('materials', id);
}