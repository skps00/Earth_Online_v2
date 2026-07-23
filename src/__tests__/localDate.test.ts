import { localDateFromSqliteUtc, localDateString } from '@/utils/localDate';

describe('localDateString', () => {
  it('formats local calendar date', () => {
    const d = new Date(2026, 6, 12, 16, 15, 0); // Jul 12 2026 local
    expect(localDateString(d)).toBe('2026-07-12');
  });
});

describe('localDateFromSqliteUtc', () => {
  it('parses SQLite UTC datetime to a local calendar date', () => {
    // 2026-07-12 16:00 UTC → local date depends on TZ; assert via Date parse
    const raw = '2026-07-12 16:00:00';
    expect(localDateFromSqliteUtc(raw)).toBe(localDateString(new Date('2026-07-12T16:00:00Z')));
  });
});
