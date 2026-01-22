import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Asset, FileContent } from '../types/models';

type ModangDBSchema = DBSchema & {
  fileContents: {
    key: string; // fileId
    value: FileContent;
  };
  assets: {
    key: string; // asset id
    value: Asset;
  };
};

let dbPromise: ReturnType<typeof openDB<ModangDBSchema>> | null = null;

export function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<ModangDBSchema>('modang-db', 1, {
      upgrade(db: IDBPDatabase<ModangDBSchema>) {
        if (!db.objectStoreNames.contains('fileContents')) {
          db.createObjectStore('fileContents', { keyPath: 'fileId' });
        }
        if (!db.objectStoreNames.contains('assets')) {
          db.createObjectStore('assets', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function getFileContent(fileId: string): Promise<FileContent | undefined> {
  const db = await getDb();
  return db.get('fileContents', fileId);
}

export async function putFileContent(record: FileContent): Promise<void> {
  const db = await getDb();
  await db.put('fileContents', record);
}

export async function deleteFileContent(fileId: string): Promise<void> {
  const db = await getDb();
  await db.delete('fileContents', fileId);
}

export async function getAsset(assetId: string): Promise<Asset | undefined> {
  const db = await getDb();
  return db.get('assets', assetId);
}

export async function putAsset(asset: Asset): Promise<void> {
  const db = await getDb();
  await db.put('assets', asset);
}

export async function deleteAsset(assetId: string): Promise<void> {
  const db = await getDb();
  await db.delete('assets', assetId);
}

export async function clearAll(): Promise<void> {
  const db = await getDb();
  await Promise.all([db.clear('fileContents'), db.clear('assets')]);
}
