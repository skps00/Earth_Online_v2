import { getTokens } from './GoogleAuthService';
import { Logger } from '@/utils/logger';

const BACKUP_FILENAME = 'earth_online_backup.json';

async function getAuthHeader(): Promise<string> {
  const tokens = await getTokens();
  if (!tokens) throw new Error('Not authenticated');
  return `Bearer ${tokens.accessToken}`;
}

export async function uploadToDrive(jsonContent: string): Promise<void> {
  const authHeader = await getAuthHeader();
  const existingFile = await findBackupFile();

  if (existingFile) {
    const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existingFile}?uploadType=media`, {
      method: 'PATCH',
      headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
      body: jsonContent,
    });
    if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
  } else {
    const metadata = { name: BACKUP_FILENAME, parents: ['appDataFolder'] };
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ metadata, file: jsonContent }),
    });
    if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
  }
  Logger.info('Drive', 'Backup uploaded successfully');
}

export async function downloadFromDrive(): Promise<string | null> {
  const authHeader = await getAuthHeader();
  const fileId = await findBackupFile();
  if (!fileId) return null;

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: authHeader },
  });
  if (!response.ok) throw new Error(`Download failed: ${response.status}`);
  Logger.info('Drive', 'Backup downloaded successfully');
  return await response.text();
}

async function findBackupFile(): Promise<string | null> {
  const authHeader = await getAuthHeader();
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${BACKUP_FILENAME}'&fields=files(id,name)`,
    { headers: { Authorization: authHeader } }
  );
  if (!response.ok) return null;
  const data = await response.json();
  return data.files?.[0]?.id ?? null;
}
