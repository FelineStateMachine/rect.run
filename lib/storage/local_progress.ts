import {
  parsePuzzleProgress,
  type PuzzleHistoryEntry,
  type PuzzleProgress,
} from "@/lib/shikaku/types.ts";

const STORAGE_NAMESPACE = "shikaku:v1";

export function buildProgressKey(puzzleId: string): string {
  return `${STORAGE_NAMESPACE}:progress:${puzzleId}`;
}

export function buildHistoryKey(): string {
  return `${STORAGE_NAMESPACE}:history`;
}

export function loadPuzzleProgress(
  storage: Pick<Storage, "getItem">,
  puzzleId: string,
): PuzzleProgress | null {
  const raw = storage.getItem(buildProgressKey(puzzleId));
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
  storage.setItem(
    buildProgressKey(progress.puzzleId),
    JSON.stringify(progress),
  );
}

export function archiveProgress(
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem">,
  entry: PuzzleHistoryEntry,
): void {
  const existing = loadHistory(storage);
  existing.push(entry);
  storage.setItem(buildHistoryKey(), JSON.stringify(existing));
  storage.removeItem(buildProgressKey(entry.puzzleId));
}

export function getAchievedStackIndex(
  storage: Pick<Storage, "length" | "key" | "getItem">,
  date: string,
): number {
  let highestSolvedIndex = -1;

  for (const progress of listDailyProgress(storage, date)) {
    if (progress.status !== "solved") continue;
    highestSolvedIndex = Math.max(highestSolvedIndex, progress.stackIndex);
  }

  return Math.max(highestSolvedIndex, 0);
}

export function getPlayableStackIndex(
  storage: Pick<Storage, "length" | "key" | "getItem">,
  date: string,
): number {
  const progressByIndex = new Map<number, PuzzleProgress["status"]>();

  for (const progress of listDailyProgress(storage, date)) {
    progressByIndex.set(progress.stackIndex, progress.status);
  }

  let playableStackIndex = 0;
  while (progressByIndex.get(playableStackIndex) === "solved") {
    playableStackIndex += 1;
  }

  return playableStackIndex;
}

export function getMostRecentStackIndex(
  storage: Pick<Storage, "length" | "key" | "getItem">,
  date: string,
): number {
  let latest = { stackIndex: 0, updatedAt: "" };

  for (const progress of listDailyProgress(storage, date)) {
    if (progress.updatedAt >= latest.updatedAt) {
      latest = {
        stackIndex: progress.stackIndex,
        updatedAt: progress.updatedAt,
      };
    }
  }

  return latest.stackIndex;
}

export function getVisibleStackRange(
  storage: Pick<Storage, "length" | "key" | "getItem">,
  date: string,
): { min: number; max: number } {
  let max = 0;

  for (const progress of listDailyProgress(storage, date)) {
    max = Math.max(max, progress.stackIndex);
  }

  return { min: 0, max };
}

export function getSelectedStackIndex(
  storage: Pick<Storage, "length" | "key" | "getItem">,
  date: string,
): number {
  return getVisibleStackRange(storage, date).max;
}

function listDailyProgress(
  storage: Pick<Storage, "length" | "key" | "getItem">,
  date: string,
): Array<PuzzleProgress & { stackIndex: number }> {
  const entries: Array<PuzzleProgress & { stackIndex: number }> = [];

  for (let index = 0; index < storage.length; index++) {
    const key = storage.key(index);
    if (!key?.startsWith(`${STORAGE_NAMESPACE}:progress:daily-${date}-`)) {
      continue;
    }

    const raw = storage.getItem(key);
    if (!raw) continue;

    try {
      const progress = parsePuzzleProgress(JSON.parse(raw));
      if (!progress) continue;
      const match = progress.puzzleId.match(/-(\d+)$/);
      if (!match) continue;
      entries.push({ ...progress, stackIndex: Number(match[1]) });
    } catch {
      continue;
    }
  }

  return entries;
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
