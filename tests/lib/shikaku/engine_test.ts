import { assertEquals } from "@std/assert";

import {
  canonicalizeRectangle,
  createRectangleFromCorners,
  getRectangleCells,
  isPuzzleSolved,
  validateRectanglePlacement,
} from "@/lib/shikaku/engine.ts";
import type { PlacedRectangle, ShikakuPuzzle } from "@/lib/shikaku/types.ts";

const samplePuzzle: ShikakuPuzzle = {
  id: "daily-2026-04-16",
  date: "2026-04-16",
  width: 4,
  height: 4,
  difficulty: "easy",
  seed: "sample-seed",
  givens: [
    { id: 0, row: 0, col: 0, value: 4 },
    { id: 1, row: 0, col: 2, value: 4 },
    { id: 2, row: 2, col: 0, value: 4 },
    { id: 3, row: 2, col: 2, value: 4 },
  ],
  solution: [
    { clueId: 0, row: 0, col: 0, width: 2, height: 2, value: 4 },
    { clueId: 1, row: 0, col: 2, width: 2, height: 2, value: 4 },
    { clueId: 2, row: 2, col: 0, width: 2, height: 2, value: 4 },
    { clueId: 3, row: 2, col: 2, width: 2, height: 2, value: 4 },
  ],
};

Deno.test("createRectangleFromCorners normalizes drag direction", () => {
  assertEquals(
    createRectangleFromCorners({ row: 1, col: 1 }, { row: 0, col: 0 }),
    {
      row: 0,
      col: 0,
      width: 2,
      height: 2,
    },
  );
});

Deno.test("getRectangleCells expands every covered cell", () => {
  assertEquals(getRectangleCells({ row: 1, col: 1, width: 2, height: 2 }), [
    "1,1",
    "1,2",
    "2,1",
    "2,2",
  ]);
});

Deno.test("validateRectanglePlacement accepts valid clue-matching rectangle", () => {
  const candidate = { row: 0, col: 0, width: 2, height: 2 };

  assertEquals(validateRectanglePlacement(samplePuzzle, candidate, []), {
    ok: true,
    given: { id: 0, row: 0, col: 0, value: 4 },
  });
});

Deno.test("validateRectanglePlacement accepts rectangles whose clue is not at the drag start", () => {
  const offCenterPuzzle: ShikakuPuzzle = {
    id: "off-center",
    date: "2026-04-16",
    width: 3,
    height: 2,
    difficulty: "easy",
    seed: "off-center",
    givens: [{ id: 0, row: 0, col: 1, value: 6 }],
    solution: [{ clueId: 0, row: 0, col: 0, width: 3, height: 2, value: 6 }],
  };

  assertEquals(
    validateRectanglePlacement(offCenterPuzzle, {
      row: 0,
      col: 0,
      width: 3,
      height: 2,
    }, []),
    {
      ok: true,
      given: { id: 0, row: 0, col: 1, value: 6 },
    },
  );

  assertEquals(
    validateRectanglePlacement(samplePuzzle, {
      row: 0,
      col: 1,
      width: 2,
      height: 2,
    }, []),
    {
      ok: true,
      given: { id: 1, row: 0, col: 2, value: 4 },
    },
  );
});

Deno.test("validateRectanglePlacement rejects overlap and multiple givens", () => {
  const existing: PlacedRectangle[] = [{
    clueId: 0,
    row: 0,
    col: 0,
    width: 2,
    height: 2,
    value: 4,
  }];

  assertEquals(
    validateRectanglePlacement(samplePuzzle, {
      row: 0,
      col: 0,
      width: 3,
      height: 2,
    }, []),
    {
      ok: false,
      reason: "multiple-givens",
    },
  );

  assertEquals(
    validateRectanglePlacement(samplePuzzle, {
      row: 0,
      col: 1,
      width: 2,
      height: 2,
    }, existing),
    {
      ok: false,
      reason: "overlap",
    },
  );
});

Deno.test("isPuzzleSolved accepts any valid full tiling, not only the planned one", () => {
  assertEquals(isPuzzleSolved(samplePuzzle, samplePuzzle.solution ?? []), true);

  const multiSolutionPuzzle: ShikakuPuzzle = {
    id: "multi-solution",
    date: "2026-04-16",
    width: 2,
    height: 2,
    difficulty: "easy",
    seed: "multi-solution",
    givens: [
      { id: 0, row: 0, col: 0, value: 2 },
      { id: 1, row: 1, col: 1, value: 2 },
    ],
    solution: [
      { clueId: 0, row: 0, col: 0, width: 2, height: 1, value: 2 },
      { clueId: 1, row: 1, col: 0, width: 2, height: 1, value: 2 },
    ],
  };

  const alternateValidTiling: PlacedRectangle[] = [
    { clueId: 0, row: 0, col: 0, width: 1, height: 2, value: 2 },
    { clueId: 1, row: 0, col: 1, width: 1, height: 2, value: 2 },
  ];

  assertEquals(isPuzzleSolved(multiSolutionPuzzle, alternateValidTiling), true);
  assertEquals(
    isPuzzleSolved(samplePuzzle, [
      { clueId: 0, row: 0, col: 0, width: 4, height: 1, value: 4 },
    ]),
    false,
  );
});

Deno.test("canonicalizeRectangle returns a stable key", () => {
  assertEquals(
    canonicalizeRectangle({
      clueId: 3,
      row: 2,
      col: 2,
      width: 2,
      height: 2,
      value: 4,
    }),
    "3:2:2:2:2:4",
  );
});
