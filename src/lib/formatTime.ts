// 月→秒の換算は 30日/月 固定（表示と一貫させるための意図的な単純化）

const SEC_PER_MIN   = 60;
const SEC_PER_HOUR  = 60 * SEC_PER_MIN;
const SEC_PER_DAY   = 24 * SEC_PER_HOUR;
const SEC_PER_MONTH = 30 * SEC_PER_DAY;
const SEC_PER_YEAR  = 365 * SEC_PER_DAY;

export function monthsToSeconds(months: number): number {
  return Math.floor(months * SEC_PER_MONTH);
}

export interface TimeComponents {
  years:   number;
  months:  number;
  days:    number;
  hours:   number;
  minutes: number;
  seconds: number;
}

export function secondsToComponents(totalSeconds: number): TimeComponents {
  let s = Math.max(0, Math.floor(totalSeconds));
  const years   = Math.floor(s / SEC_PER_YEAR);  s %= SEC_PER_YEAR;
  const months  = Math.floor(s / SEC_PER_MONTH); s %= SEC_PER_MONTH;
  const days    = Math.floor(s / SEC_PER_DAY);   s %= SEC_PER_DAY;
  const hours   = Math.floor(s / SEC_PER_HOUR);  s %= SEC_PER_HOUR;
  const minutes = Math.floor(s / SEC_PER_MIN);
  const seconds = s % SEC_PER_MIN;
  return { years, months, days, hours, minutes, seconds };
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}
