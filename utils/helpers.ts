const MONTHS_UZ = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
];

export function getMonthName(monthIndex: number): string {
  return MONTHS_UZ[monthIndex] ?? '';
}

export function getMonthIndex(monthName: string): number {
  return MONTHS_UZ.indexOf(monthName);
}

export function getAllMonthNames(): string[] {
  return MONTHS_UZ;
}

export function getCurrentYear(): string {
  return new Date().getFullYear().toString();
}

export function getCurrentMonth(): string {
  return MONTHS_UZ[new Date().getMonth()] ?? '';
}

export function getCurrentDateString(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

export function isCurrentYear(year: string): boolean {
  return year === getCurrentYear();
}

export function isCurrentMonth(monthName: string): boolean {
  return monthName === getCurrentMonth();
}
