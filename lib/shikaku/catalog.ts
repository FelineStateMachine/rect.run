import { createPuzzleFromDailySeed } from "@/lib/shikaku/generator.ts";
import type { ShikakuPuzzle } from "@/lib/shikaku/types.ts";

export function getPuzzleByDate(date: string): ShikakuPuzzle | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null;
  }

  return createPuzzleFromDailySeed(date);
}

export function listAvailablePuzzleDates(): string[] {
  return [new Date().toISOString().slice(0, 10)];
}
