import { assertEquals } from "@std/assert";

import {
  dateToSlug,
  isPastDate,
  rolloverExpiredProgress,
} from "@/lib/date/daily.ts";
import type { PuzzleProgress } from "@/lib/shikaku/types.ts";

Deno.test("dateToSlug formats local dates as YYYY-MM-DD", () => {
  const slug = dateToSlug(new Date(2026, 3, 16, 12, 30, 45));

  assertEquals(slug, "2026-04-16");
});

Deno.test("isPastDate compares date slugs correctly", () => {
  assertEquals(isPastDate("2026-04-15", "2026-04-16"), true);
  assertEquals(isPastDate("2026-04-16", "2026-04-16"), false);
  assertEquals(isPastDate("2026-04-17", "2026-04-16"), false);
});

Deno.test("rolloverExpiredProgress archives unfinished progress from prior days", () => {
  const progress: PuzzleProgress = {
    date: "2026-04-15",
    puzzleId: "daily-2026-04-15",
    startedAt: "2026-04-15T08:00:00.000Z",
    updatedAt: "2026-04-15T08:10:00.000Z",
    status: "in_progress",
    elapsedMs: 600000,
    mistakes: 2,
    selections: [],
    notes: {},
    lastViewedAt: "2026-04-15T08:10:00.000Z",
    clientVersion: 1,
  };

  assertEquals(rolloverExpiredProgress(progress, "2026-04-16"), {
    date: "2026-04-15",
    puzzleId: "daily-2026-04-15",
    status: "expired_unsolved",
    mistakes: 2,
  });
});
