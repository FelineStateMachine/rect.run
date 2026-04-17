import { assertEquals, assertExists } from "@std/assert";

import {
  createDefaultSettings,
  CURRENT_STORAGE_VERSION,
  parsePuzzleProgress,
} from "@/lib/shikaku/types.ts";

Deno.test("createDefaultSettings returns expected mobile-friendly defaults", () => {
  assertEquals(createDefaultSettings(), {
    theme: "system",
    reducedMotion: false,
    hapticsEnabled: true,
    handedness: "right",
    showRegionHints: true,
  });
});

Deno.test("parsePuzzleProgress migrates missing clientVersion to current version", () => {
  const progress = parsePuzzleProgress({
    date: "2026-04-16",
    puzzleId: "daily-2026-04-16",
    startedAt: "2026-04-16T10:00:00.000Z",
    updatedAt: "2026-04-16T10:05:00.000Z",
    status: "in_progress",
    elapsedMs: 120000,
    mistakes: 1,
    selections: [
      { clueId: 7, cells: ["0,0", "0,1", "1,0", "1,1"], value: 4 },
    ],
    notes: {},
    lastViewedAt: "2026-04-16T10:05:00.000Z",
  });

  assertExists(progress);
  assertEquals(progress.clientVersion, CURRENT_STORAGE_VERSION);
  assertEquals(progress.status, "in_progress");
  assertEquals(progress.selections[0].clueId, 7);
});

Deno.test("parsePuzzleProgress returns null for malformed payloads", () => {
  assertEquals(parsePuzzleProgress({ date: "2026-04-16" }), null);
  assertEquals(parsePuzzleProgress(null), null);
});
