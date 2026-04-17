import { assertEquals, assertExists } from "@std/assert";

import {
  getPuzzleByDate,
  listAvailablePuzzleDates,
} from "@/lib/shikaku/catalog.ts";

Deno.test("getPuzzleByDate returns a deterministic generated puzzle for a valid date", () => {
  const puzzle = getPuzzleByDate("2026-04-16");

  assertExists(puzzle);
  assertEquals(puzzle.id, "daily-2026-04-16");
  assertEquals(puzzle.width, 8);
  assertEquals(puzzle.height, 8);
  assertEquals(puzzle.seed, "2026-04-16");
});

Deno.test("getPuzzleByDate rejects invalid date slugs", () => {
  assertEquals(getPuzzleByDate("not-a-date"), null);
});

Deno.test("listAvailablePuzzleDates returns today by default", () => {
  assertEquals(listAvailablePuzzleDates(), [
    new Date().toISOString().slice(0, 10),
  ]);
});
