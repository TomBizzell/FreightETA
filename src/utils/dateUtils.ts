import { format } from 'date-fns';

export const isValidDate = (date: Date | null | undefined): date is Date => {
  return date instanceof Date && !isNaN(date.getTime());
};

export const safeFormatDate = (date: Date | null | undefined, formatString: string) => {
  if (!isValidDate(date)) {
    return 'Invalid date';
  }
  return format(date, formatString);
}; 