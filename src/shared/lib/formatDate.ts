const MONTH_YEAR = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
});

const ISO_DATE = new Intl.DateTimeFormat('en-CA'); // produces YYYY-MM-DD

export function formatMonthYear(date: Date): string {
  return MONTH_YEAR.format(date);
}

export function formatISO(date: Date): string {
  return ISO_DATE.format(date);
}
