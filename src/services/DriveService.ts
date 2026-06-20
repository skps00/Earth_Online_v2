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
  Logger.info('Drive', `Auth header: ${authHeader.substring(0, 20)}...`);

  // Verify token scopes
  try {
    const tokenInfo = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${authHeader.replace('Bearer ', '')}`);
    const tokenData = await tokenInfo.json();
    Logger.info('Drive', `Token scopes: ${tokenData.scope}`);
    Logger.info('Drive', `Token audience: ${tokenData.audience}`);
  } catch (e) {
    Logger.error('Drive', 'Failed to verify token', e);
  }

  const existingFile = await findBackupFile();
  Logger.info('Drive', `Existing file: ${existingFile}`);

  if (existingFile) {
    Logger.info('Drive', 'Updating existing file');
    const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existingFile}?uploadType=media`, {
      method: 'PATCH',
      headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
      body: jsonContent,
    });
    if (!response.ok) {
      const errorText = await response.text();
      Logger.error('Drive', `Upload error: ${response.status} - ${errorText}`);
      throw new Error(`Upload failed: ${response.status}`);
    }
  } else {
    Logger.info('Drive', 'Creating new file');
    const metadata = JSON.stringify({ name: BACKUP_FILENAME, parents: ['appDataFolder'] });
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;
    const multipartBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      metadata +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      jsonContent +
      closeDelimiter;
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    });
    if (!response.ok) {
      const errorText = await response.text();
      Logger.error('Drive', `Upload error: ${response.status} - ${errorText}`);
      throw new Error(`Upload failed: ${response.status}`);
    }
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
