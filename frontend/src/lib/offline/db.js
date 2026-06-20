import { openDB } from 'idb';

const DB_NAME = 'neokarma-offline';
const DB_VERSION = 1;
const STORE_NAME = 'pendingLogs';

export async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'localId',
          autoIncrement: true,
        });
        store.createIndex('syncStatus', 'syncStatus');
        store.createIndex('date', 'date');
      }
    },
  });
}

export async function savePendingLog(logData) {
  const db = await getDb();
  return db.add(STORE_NAME, {
    ...logData,
    syncStatus: 'pending', // 'pending' | 'synced' | 'failed'
    createdOfflineAt: new Date().toISOString(),
  });
}

export async function getPendingLogs() {
  const db = await getDb();
  return db.getAllFromIndex(STORE_NAME, 'syncStatus', 'pending');
}

export async function markLogSynced(localId) {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const record = await tx.store.get(localId);
  if (record) {
    record.syncStatus = 'synced';
    await tx.store.put(record);
  }
  await tx.done;
}

export async function markLogFailed(localId, errorMessage) {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const record = await tx.store.get(localId);
  if (record) {
    record.syncStatus = 'failed';
    record.lastError = errorMessage;
    await tx.store.put(record);
  }
  await tx.done;
}

export async function deleteSyncedLogs() {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const allRecords = await tx.store.getAll();
  for (const record of allRecords) {
    if (record.syncStatus === 'synced') {
      await tx.store.delete(record.localId);
    }
  }
  await tx.done;
}
