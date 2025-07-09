import { DateTime } from "luxon";
/**
 * Converts a local date-time string and time zone into a UTC ISO string.
 *
 * @param localDateTime - e.g., '2025-07-23T08:00:00'
 * @param timeZone - IANA time zone name, e.g., 'America/Belize'
 * @returns UTC ISO string, e.g., '2025-07-23T14:00:00.000Z'
 */
export function convertToUtcIso(localDateTime: string, timeZone: string): string {
     const dt = DateTime.fromISO(localDateTime, { zone: timeZone });
    if (!dt.isValid) {
        throw new Error(`Invalid date/time or time zone: ${dt.invalidReason}`);
    }

    return dt.toUTC().toISO();
}
