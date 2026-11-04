import { subDays, subHours, addDays, addHours, formatISO } from 'date-fns';

// Mulberry32 seeded random generator
export function createRNG(seed = 123456789) {
  let s = seed;
  return function () {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const rng = createRNG(424242);

export function randomChoice<T>(arr: T[], customRng = rng): T {
  return arr[Math.floor(customRng() * arr.length)];
}

export function randomNumber(min: number, max: number, customRng = rng): number {
  return Math.floor(customRng() * (max - min + 1)) + min;
}

// Relative date generator: baseDate is today (Nov 04, 2026 or real current Date)
const BASE_DATE = new Date();

export function relativeDaysAgo(days: number, hoursOffset = 0): string {
  const d = subDays(BASE_DATE, days);
  const adjusted = hoursOffset !== 0 ? (hoursOffset > 0 ? addHours(d, hoursOffset) : subHours(d, Math.abs(hoursOffset))) : d;
  return formatISO(adjusted);
}

export function relativeDaysAhead(days: number, hoursOffset = 0): string {
  const d = addDays(BASE_DATE, days);
  const adjusted = hoursOffset !== 0 ? (hoursOffset > 0 ? addHours(d, hoursOffset) : subHours(d, Math.abs(hoursOffset))) : d;
  return formatISO(adjusted);
}

