import { computeOpenStatus, type OpenStatus } from '@repo/validators'

/** Server-side first value for <OpenStatusStamp>; the client keeps it current every minute. */
export function initialStatus(
  b: { openingHours: unknown; closedUntil: string | null; closedNote: string | null },
  timeZone: string,
): OpenStatus {
  return computeOpenStatus({
    hours: b.openingHours,
    closedUntil: b.closedUntil,
    closedNote: b.closedNote,
    timeZone,
  })
}
