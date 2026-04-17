import { assertEquals, assertExists, assertNotEquals } from "@std/assert";

import {
  getPuzzleByDateIndex,
  listAvailablePuzzleDates,
} from "@/lib/shikaku/catalog.ts";

Deno.test("getPuzzleByDateIndex returns a deterministic generated puzzle for a valid date and streak index", () => {
  const puzzle = getPuzzleByDateIndex("2026-04-16", 0);

  assertExists(puzzle);
  assertEquals(puzzle.id, "daily-2026-04-16-0");
  assertEquals(puzzle.width, 8);
  assertEquals(puzzle.height, 8);
  assertEquals(puzzle.seed, "2026-04-16:0");
  assertEquals(puzzle.streakIndex, 0);
});

Deno.test("getPuzzleByDateIndex changes the puzzle when the streak index changes", () => {
  const first = getPuzzleByDateIndex("2026-04-16", 0);
  const second = getPuzzleByDateIndex("2026-04-16", 1);

  assertExists(first);
  assertExists(second);
  assertNotEquals(first.seed, second.seed);
  assertNotEquals(first.id, second.id);
});

Deno.test("getPuzzleByDateIndex rejects invalid date slugs or negative indexes", () => {
  assertEquals(getPuzzleByDateIndex("not-a-date", 0), null);
  assertEquals(getPuzzleByDateIndex("2026-04-16", -1), null);
});

Deno.test("listAvailablePuzzleDates returns the streak start date through a provided day", () => {
  assertEquals(listAvailablePuzzleDates("2026-04-18"), [
    "2026-04-16",
    "2026-04-17",
    "2026-04-18",
  ]);
});
