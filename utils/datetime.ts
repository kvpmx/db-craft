import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

export const formatDate = (date: string) => {
  return format(date, 'dd.MM.yyyy');
};

export const formatDateAndTime = (date: string) => {
  return formatInTimeZone(
    date,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    'dd.MM.yyyy, HH:mm:ss'
  );
};
