export type StoreName =
  | 'subjects'
  | 'students'
  | 'works'
  | 'grades'
  | 'materials'
  | 'settings';

interface StoreDef {
  name: StoreName;
  keyPath: string;
  indexes?: { name: string; keyPath: string }[];
}

const STORES: StoreDef[] = [
  { name: 'subjects', keyPath: 'id' },
  { name: 'students', keyPath: 'id' },
  {
    name: 'works',
    keyPath: 'id',
    indexes: [{ name: 'by_subject', keyPath: 'subjectId' }]
  },
  {
    name: 'grades',
    keyPath: 'id',
    indexes: [
      { name: 'by_subject', keyPath: 'subjectId' },
      { name: 'by_work', keyPath: 'workId' }
    ]
  },
  {
    name: 'materials',
    keyPath: 'id',
    indexes: [{ name: 'by_subject', keyPath: 'subjectId' }]
  },
  { name: 'settings', keyPath: 'key' }
];

const DB_NAME = 'groupJournalDb';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

export function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const def of STORES) {
        if (!db.objectStoreNames.contains(def.name)) {
          const store = db.createObjectStore(def.name, { keyPath: def.keyPath });
          for (const idx of def.indexes ?? []) {
            store.createIndex(idx.name, idx.keyPath, { unique: false });
          }
        }
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('blocked'));
  });
  return dbPromise;
}

function toPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getAll<T>(store: StoreName): Promise<T[]> {
  const db = await openDb();
  const t = db.transaction(store, 'readonly');
  return toPromise(t.objectStore(store).getAll() as IDBRequest<T[]>);
}

export async function getAllByIndex<T>(
  store: StoreName,
  indexName: string,
  value: IDBValidKey
): Promise<T[]> {
  const db = await openDb();
  const t = db.transaction(store, 'readonly');
  const idx = t.objectStore(store).index(indexName);
  return toPromise(idx.getAll(value) as IDBRequest<T[]>);
}

export async function get<T>(
  store: StoreName,
  id: string | IDBValidKey
): Promise<T | undefined> {
  const db = await openDb();
  const t = db.transaction(store, 'readonly');
  return toPromise(t.objectStore(store).get(id) as IDBRequest<T | undefined>);
}

export async function put(store: StoreName, data: unknown): Promise<IDBValidKey> {
  const db = await openDb();
  const t = db.transaction(store, 'readwrite');
  return toPromise(t.objectStore(store).put(data) as IDBRequest<IDBValidKey>);
}

export async function bulkPut(store: StoreName, records: unknown[]): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const t = db.transaction(store, 'readwrite');
    const s = t.objectStore(store);
    for (const rec of records) s.put(rec);
    t.oncomplete = () => resolve();
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

export async function del(store: StoreName, id: IDBValidKey): Promise<void> {
  const db = await openDb();
  const t = db.transaction(store, 'readwrite');
  return toPromise(t.objectStore(store).delete(id) as IDBRequest<void>);
}

export async function deleteAllByIndex(
  store: StoreName,
  indexName: string,
  value: IDBValidKey
): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const t = db.transaction(store, 'readwrite');
    const idx = t.objectStore(store).index(indexName);
    const req = idx.openKeyCursor(value);
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        resolve();
      }
    };
    req.onerror = () => reject(req.error);
  });
}

export async function count(store: StoreName): Promise<number> {
  const db = await openDb();
  const t = db.transaction(store, 'readonly');
  return toPromise(t.objectStore(store).count() as IDBRequest<number>);
}