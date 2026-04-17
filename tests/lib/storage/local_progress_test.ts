import { assertEquals } from "@std/assert";

import {
  archiveProgress,
  buildHistoryKey,
  buildProgressKey,
  getAchievedStackIndex,
  getMostRecentStackIndex,
  getPlayableStackIndex,
  getSelectedStackIndex,
  getVisibleStackRange,
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
    puzzleId: "daily-2026-04-16-0",
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

function createProgressFor(
  puzzleId: string,
  status: PuzzleProgress["status"],
  updatedAt: string,
): PuzzleProgress {
  return {
    ...createProgress(),
    date: puzzleId.split("-").slice(1, 4).join("-"),
    puzzleId,
    status,
    updatedAt,
    lastViewedAt: updatedAt,
  };
}

Deno.test("buildProgressKey and buildHistoryKey use versioned storage keys", () => {
  assertEquals(
    buildProgressKey("daily-2026-04-16-0"),
    "shikaku:v1:progress:daily-2026-04-16-0",
  );
  assertEquals(buildHistoryKey(), "shikaku:v1:history");
});

Deno.test("savePuzzleProgress and loadPuzzleProgress roundtrip progress", () => {
  const storage = new MemoryStorage();
  const progress = createProgress();

  savePuzzleProgress(storage, progress);

  assertEquals(loadPuzzleProgress(storage, progress.puzzleId), progress);
});

Deno.test("loadPuzzleProgress ignores malformed json", () => {
  const storage = new MemoryStorage();
  storage.setItem(buildProgressKey("daily-2026-04-16-0"), "{not-json");

  assertEquals(loadPuzzleProgress(storage, "daily-2026-04-16-0"), null);
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

  assertEquals(loadPuzzleProgress(storage, progress.puzzleId), null);
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

Deno.test("getAchievedStackIndex returns the highest solved index for a day", () => {
  const storage = new MemoryStorage();

  savePuzzleProgress(storage, {
    ...createProgress(),
    puzzleId: "daily-2026-04-16-0",
    status: "solved",
  });
  savePuzzleProgress(storage, {
    ...createProgress(),
    puzzleId: "daily-2026-04-16-1",
    status: "solved",
  });
  savePuzzleProgress(storage, {
    ...createProgress(),
    puzzleId: "daily-2026-04-16-2",
    status: "in_progress",
  });

  assertEquals(getAchievedStackIndex(storage, "2026-04-16"), 1);
  assertEquals(getAchievedStackIndex(storage, "2026-04-17"), 0);
});

Deno.test("getPlayableStackIndex starts at zero and unlocks the next stack only after a solve", () => {
  const storage = new MemoryStorage();

  assertEquals(getPlayableStackIndex(storage, "2026-04-16"), 0);

  savePuzzleProgress(storage, {
    ...createProgress(),
    puzzleId: "daily-2026-04-16-0",
    status: "in_progress",
  });
  assertEquals(getPlayableStackIndex(storage, "2026-04-16"), 0);

  savePuzzleProgress(storage, {
    ...createProgress(),
    puzzleId: "daily-2026-04-16-0",
    status: "solved",
  });
  assertEquals(getPlayableStackIndex(storage, "2026-04-16"), 1);

  savePuzzleProgress(storage, {
    ...createProgress(),
    puzzleId: "daily-2026-04-16-1",
    status: "in_progress",
  });
  assertEquals(getPlayableStackIndex(storage, "2026-04-16"), 1);
});

Deno.test("getPlayableStackIndex ignores non-contiguous solved entries", () => {
  const storage = new MemoryStorage();

  savePuzzleProgress(storage, {
    ...createProgress(),
    puzzleId: "daily-2026-04-16-1",
    status: "solved",
  });

  assertEquals(getPlayableStackIndex(storage, "2026-04-16"), 0);
});

Deno.test("getMostRecentStackIndex returns the last touched stack for a date", () => {
  const storage = new MemoryStorage();

  savePuzzleProgress(
    storage,
    createProgressFor(
      "daily-2026-04-16-0",
      "solved",
      "2026-04-16T10:03:00.000Z",
    ),
  );
  savePuzzleProgress(
    storage,
    createProgressFor(
      "daily-2026-04-16-2",
      "in_progress",
      "2026-04-16T10:07:00.000Z",
    ),
  );

  assertEquals(getMostRecentStackIndex(storage, "2026-04-16"), 2);
  assertEquals(getMostRecentStackIndex(storage, "2026-04-17"), 0);
});

Deno.test("getVisibleStackRange exposes the highest touched stack for date navigation", () => {
  const storage = new MemoryStorage();

  savePuzzleProgress(
    storage,
    createProgressFor(
      "daily-2026-04-16-0",
      "solved",
      "2026-04-16T10:03:00.000Z",
    ),
  );
  savePuzzleProgress(
    storage,
    createProgressFor(
      "daily-2026-04-16-3",
      "in_progress",
      "2026-04-16T10:07:00.000Z",
    ),
  );

  assertEquals(getVisibleStackRange(storage, "2026-04-16"), { min: 0, max: 3 });
  assertEquals(getVisibleStackRange(storage, "2026-04-17"), { min: 0, max: 0 });
});

Deno.test("getSelectedStackIndex returns the top stack for a date", () => {
  const storage = new MemoryStorage();

  savePuzzleProgress(
    storage,
    createProgressFor(
      "daily-2026-04-16-0",
      "solved",
      "2026-04-16T10:03:00.000Z",
    ),
  );
  savePuzzleProgress(
    storage,
    createProgressFor(
      "daily-2026-04-16-2",
      "in_progress",
      "2026-04-16T10:07:00.000Z",
    ),
  );

  assertEquals(getSelectedStackIndex(storage, "2026-04-16"), 2);
  assertEquals(getSelectedStackIndex(storage, "2026-04-17"), 0);
});

Deno.test("getSelectedStackIndex prefers the highest visible stack over a lower recent one", () => {
  const storage = new MemoryStorage();

  savePuzzleProgress(
    storage,
    createProgressFor(
      "daily-2026-04-16-1",
      "in_progress",
      "2026-04-16T10:09:00.000Z",
    ),
  );
  savePuzzleProgress(
    storage,
    createProgressFor(
      "daily-2026-04-16-2",
      "solved",
      "2026-04-16T10:05:00.000Z",
    ),
  );

  assertEquals(getSelectedStackIndex(storage, "2026-04-16"), 2);
});
