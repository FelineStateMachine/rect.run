import type {
  PuzzleHistoryEntry,
  PuzzleProgress,
} from "@/lib/shikaku/types.ts";

export function dateToSlug(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isPastDate(candidate: string, today: string): boolean {
  return candidate < today;
}

export function rolloverExpiredProgress(
  progress: PuzzleProgress,
  today: string,
): PuzzleHistoryEntry | null {
  if (progress.status !== "in_progress") return null;
  if (!isPastDate(progress.date, today)) return null;

  return {
    date: progress.date,
    puzzleId: progress.puzzleId,
    status: "expired_unsolved",
    mistakes: progress.mistakes,
  };
}
