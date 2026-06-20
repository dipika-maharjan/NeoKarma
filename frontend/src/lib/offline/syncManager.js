import apiClient from '../api/axios';
import { getPendingLogs, markLogSynced, markLogFailed, deleteSyncedLogs } from './db';

export async function syncPendingLogs() {
  const pending = await getPendingLogs();
  if (!pending || pending.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  for (const log of pending) {
    try {
      const { localId, syncStatus, createdOfflineAt, ...logPayload } = log;
      const response = await apiClient.post('/daily-log', logPayload);
      if (response?.status >= 200 && response.status < 300) {
        await markLogSynced(localId);
        synced++;
      } else {
        await markLogFailed(localId, `Server returned ${response.status}`);
        failed++;
      }
    } catch (err) {
      await markLogFailed(log.localId, err.message || 'Sync failed');
      failed++;
    }
  }

  await deleteSyncedLogs();
  return { synced, failed };
}
