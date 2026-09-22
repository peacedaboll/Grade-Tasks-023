import { SUBJECTS, STUDENTS } from '../database/seed-data';
import * as db from '../database/db';
import { getSetting, putSetting } from '../database/settings';
import { bulkPut } from '../database/db';

const SEED_KEY = 'seeded';

export async function ensureSeeded(): Promise<void> {
  const seeded = await getSetting<string>(SEED_KEY);
  if (seeded === '1') return;
  await bulkPut('subjects', SUBJECTS);
  await bulkPut('students', STUDENTS);
  await putSetting(SEED_KEY, '1');
}

export async function resetAllData(): Promise<void> {
  await db.bulkPut('subjects', SUBJECTS);
  await db.bulkPut('students', STUDENTS);
  await putSetting(SEED_KEY, '1');
}