import {
  parsePuzzleProgress,
  type PuzzleHistoryEntry,
  type PuzzleProgress,
} from "@/lib/shikaku/types.ts";

const STORAGE_NAMESPACE = "shikaku:v1";

export function buildProgressKey(date: string): string {
  return `${STORAGE_NAMESPACE}:progress:${date}`;
}

export function buildHistoryKey(): string {
  return `${STORAGE_NAMESPACE}:history`;
}

export function loadPuzzleProgress(
  storage: Pick<Storage, "getItem">,
  date: string,
): PuzzleProgress | null {
  const raw = storage.getItem(buildProgressKey(date));
  if (raw === null) return null;

  try {
    return parsePuzzleProgress(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function savePuzzleProgress(
  storage: Pick<Storage, "setItem">,
  progress: PuzzleProgress,
): void {
  storage.setItem(buildProgressKey(progress.date), JSON.stringify(progress));
}

export function archiveProgress(
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem">,
  entry: PuzzleHistoryEntry,
): void {
  const existing = loadHistory(storage);
  existing.push(entry);
  storage.setItem(buildHistoryKey(), JSON.stringify(existing));
  storage.removeItem(buildProgressKey(entry.date));
}

function loadHistory(storage: Pick<Storage, "getItem">): PuzzleHistoryEntry[] {
  const raw = storage.getItem(buildHistoryKey());
  if (raw === null) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as PuzzleHistoryEntry[] : [];
  } catch {
    return [];
  }
}
