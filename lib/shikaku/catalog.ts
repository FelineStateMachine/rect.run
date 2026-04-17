import { createPuzzleFromDailySeed } from "@/lib/shikaku/generator.ts";
import { dateToSlug } from "@/lib/date/daily.ts";
import type { ShikakuPuzzle } from "@/lib/shikaku/types.ts";

export const DAILY_STREAK_START_DATE = "2026-04-16";

export function getPuzzleByDateIndex(
  date: string,
  streakIndex: number,
): ShikakuPuzzle | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null;
  }

  if (!Number.isInteger(streakIndex) || streakIndex < 0) {
    return null;
  }

  return createPuzzleFromDailySeed(date, streakIndex);
}

export function getPuzzleByDate(date: string): ShikakuPuzzle | null {
  return getPuzzleByDateIndex(date, 0);
}

export function listAvailablePuzzleDates(
  today = dateToSlug(new Date()),
): string[] {
  const dates: string[] = [];
  const cursor = parseLocalDateSlug(DAILY_STREAK_START_DATE);
  const end = parseLocalDateSlug(today);

  while (cursor <= end) {
    dates.push(dateToSlug(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

function parseLocalDateSlug(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}
