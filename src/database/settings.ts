import type { SettingsRecord } from '../types';
import * as db from './db';

export async function getSetting<T>(key: string): Promise<T | undefined> {
  const rec = await db.get<SettingsRecord>('settings', key);
  return rec?.value as T | undefined;
}

export async function putSetting(key: string, value: unknown): Promise<void> {
  const rec: SettingsRecord = { key, value };
  await db.put('settings', rec);
}