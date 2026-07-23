/** Daily quest trigger types emitted during check-in. */
export function getCheckInQuestTriggers(hour: number): string[] {
  const triggers: string[] = [];
  if (hour < 6) {
    triggers.push('time');
  }
  return triggers;
}
