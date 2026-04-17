import { assert, assertEquals, assertNotEquals } from "@std/assert";

import {
  createPuzzleFromDailySeed,
  createSeededRng,
  generatePuzzleFromSeed,
} from "@/lib/shikaku/generator.ts";

Deno.test("createSeededRng is deterministic for the same string seed", () => {
  const rngA = createSeededRng("2026-04-16");
  const rngB = createSeededRng("2026-04-16");

  const valuesA = [rngA(), rngA(), rngA(), rngA()];
  const valuesB = [rngB(), rngB(), rngB(), rngB()];

  assertEquals(valuesA, valuesB);
});

Deno.test("generatePuzzleFromSeed returns stable puzzles for the same seed", () => {
  const puzzleA = generatePuzzleFromSeed("2026-04-16");
  const puzzleB = generatePuzzleFromSeed("2026-04-16");
  const puzzleC = generatePuzzleFromSeed("2026-04-17");

  assertEquals(puzzleA, puzzleB);
  assertNotEquals(puzzleA.givens, puzzleC.givens);
});

Deno.test("generated puzzle covers the full board and respects clue area invariants", () => {
  const puzzle = generatePuzzleFromSeed("2026-04-16", {
    width: 8,
    height: 8,
    maxRectSize: 8,
  });

  assertEquals(puzzle.width, 8);
  assertEquals(puzzle.height, 8);
  assert(puzzle.givens.length > 0);
  assertEquals(puzzle.solution?.length, puzzle.givens.length);

  const covered = new Set<string>();
  let totalArea = 0;

  for (const rectangle of puzzle.solution ?? []) {
    totalArea += rectangle.width * rectangle.height;

    const matchingGiven = puzzle.givens.find((given) =>
      given.id === rectangle.clueId && given.value === rectangle.value &&
      given.row >= rectangle.row &&
      given.row < rectangle.row + rectangle.height &&
      given.col >= rectangle.col && given.col < rectangle.col + rectangle.width
    );
    assert(
      matchingGiven,
      `missing matching clue for rectangle ${JSON.stringify(rectangle)}`,
    );

    for (
      let row = rectangle.row;
      row < rectangle.row + rectangle.height;
      row++
    ) {
      for (
        let col = rectangle.col;
        col < rectangle.col + rectangle.width;
        col++
      ) {
        const key = `${row},${col}`;
        assert(!covered.has(key), `cell ${key} covered more than once`);
        covered.add(key);
      }
    }
  }

  assertEquals(totalArea, puzzle.width * puzzle.height);
  assertEquals(covered.size, puzzle.width * puzzle.height);
});

Deno.test("createPuzzleFromDailySeed exposes date-based ids", () => {
  const puzzle = createPuzzleFromDailySeed("2026-04-16");

  assertEquals(puzzle.date, "2026-04-16");
  assertEquals(puzzle.id, "daily-2026-04-16");
  assertEquals(typeof puzzle.seed, "string");
});
