import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Asset, FileContent } from '../types/models';

type LocalFileHandleRecord = {
  fileId: string;
  // File System Access API (Chromium) supports structured-cloning handles into IndexedDB.
  // Keep it as unknown to stay compatible on platforms without the type/runtime.
  handle: unknown;
};

type ModangDBSchema = DBSchema & {
  fileContents: {
    key: string; // fileId
    value: FileContent;
  };
  assets: {
    key: string; // asset id
    value: Asset;
  };
  localFileHandles: {
    key: string; // fileId
    value: LocalFileHandleRecord;
  };
};

let dbPromise: ReturnType<typeof openDB<ModangDBSchema>> | null = null;

export function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<ModangDBSchema>('modang-db', 2, {
      upgrade(db: IDBPDatabase<ModangDBSchema>) {
        if (!db.objectStoreNames.contains('fileContents')) {
          db.createObjectStore('fileContents', { keyPath: 'fileId' });
        }
        if (!db.objectStoreNames.contains('assets')) {
          db.createObjectStore('assets', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('localFileHandles')) {
          db.createObjectStore('localFileHandles', { keyPath: 'fileId' });
        }
      },
    });
  }
  return dbPromise;
}

export async function getLocalFileHandle(fileId: string): Promise<unknown | undefined> {
  const db = await getDb();
  const rec = await db.get('localFileHandles', fileId);
  return rec?.handle;
}

export async function putLocalFileHandle(fileId: string, handle: unknown): Promise<void> {
  const db = await getDb();
  await db.put('localFileHandles', { fileId, handle });
}

export async function deleteLocalFileHandle(fileId: string): Promise<void> {
  const db = await getDb();
  await db.delete('localFileHandles', fileId);
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
  await Promise.all([db.clear('fileContents'), db.clear('assets'), db.clear('localFileHandles')]);
}
