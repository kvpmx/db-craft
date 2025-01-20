import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

/**
 * Format a date string into `dd.MM.yyyy` format.
 *
 * @param date - The date string to format.
 * @returns The formatted date in `dd.MM.yyyy` format.
 */
export const formatDate = (date: string) => {
  return format(date, 'dd.MM.yyyy');
};

/**
 * Format a date string into `dd.MM.yyyy, HH:mm:ss` format in the system's time zone.
 *
 * @param date - The date string to format.
 * @returns The formatted date and time in `dd.MM.yyyy, HH:mm:ss` format.
 */
export const formatDateAndTime = (date: string) => {
  return formatInTimeZone(
    date,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    'dd.MM.yyyy, HH:mm:ss'
  );
};
