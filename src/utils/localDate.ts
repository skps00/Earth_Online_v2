/** Calendar date in the device local timezone (YYYY-MM-DD). */
export function localDateString(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * SQLite `datetime('now')` / backup timestamps are UTC (`YYYY-MM-DD HH:MM:SS`).
 * Convert to the device-local calendar date for daily-limit / reset logic.
 */
export function localDateFromSqliteUtc(sqliteUtc: string): string {
  const iso =
    /[Tt]/.test(sqliteUtc) || /Z$/i.test(sqliteUtc)
      ? sqliteUtc
      : `${sqliteUtc.trim().replace(' ', 'T')}Z`;
  return localDateString(new Date(iso));
}
