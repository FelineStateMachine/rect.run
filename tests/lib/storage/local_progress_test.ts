import { assertEquals } from "@std/assert";

import {
  archiveProgress,
  buildHistoryKey,
  buildProgressKey,
  loadPuzzleProgress,
  savePuzzleProgress,
} from "@/lib/storage/local_progress.ts";
import type { PuzzleProgress } from "@/lib/shikaku/types.ts";

class MemoryStorage implements Storage {
  #data = new Map<string, string>();

  get length(): number {
    return this.#data.size;
  }

  clear(): void {
    this.#data.clear();
  }

  getItem(key: string): string | null {
    return this.#data.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.#data.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.#data.delete(key);
  }

  setItem(key: string, value: string): void {
    this.#data.set(key, value);
  }
}

function createProgress(): PuzzleProgress {
  return {
    date: "2026-04-16",
    puzzleId: "daily-2026-04-16",
    startedAt: "2026-04-16T10:00:00.000Z",
    updatedAt: "2026-04-16T10:03:00.000Z",
    status: "in_progress",
    elapsedMs: 180000,
    mistakes: 0,
    selections: [
      {
        clueId: 0,
        cells: ["0,0", "0,1", "1,0", "1,1"],
        value: 4,
      },
    ],
    notes: {},
    lastViewedAt: "2026-04-16T10:03:00.000Z",
    clientVersion: 1,
  };
}

Deno.test("buildProgressKey and buildHistoryKey use versioned storage keys", () => {
  assertEquals(
    buildProgressKey("2026-04-16"),
    "shikaku:v1:progress:2026-04-16",
  );
  assertEquals(buildHistoryKey(), "shikaku:v1:history");
});

Deno.test("savePuzzleProgress and loadPuzzleProgress roundtrip progress", () => {
  const storage = new MemoryStorage();
  const progress = createProgress();

  savePuzzleProgress(storage, progress);

  assertEquals(loadPuzzleProgress(storage, progress.date), progress);
});

Deno.test("loadPuzzleProgress ignores malformed json", () => {
  const storage = new MemoryStorage();
  storage.setItem(buildProgressKey("2026-04-16"), "{not-json");

  assertEquals(loadPuzzleProgress(storage, "2026-04-16"), null);
});

Deno.test("archiveProgress appends history entry and removes saved progress", () => {
  const storage = new MemoryStorage();
  const progress = createProgress();
  savePuzzleProgress(storage, progress);

  archiveProgress(storage, {
    date: progress.date,
    puzzleId: progress.puzzleId,
    status: "expired_unsolved",
    mistakes: progress.mistakes,
  });

  assertEquals(loadPuzzleProgress(storage, progress.date), null);
  assertEquals(
    storage.getItem(buildHistoryKey()),
    JSON.stringify([
      {
        date: progress.date,
        puzzleId: progress.puzzleId,
        status: "expired_unsolved",
        mistakes: progress.mistakes,
      },
    ]),
  );
});
