import type {
  PlacedRectangle,
  PuzzleGiven,
  RectanglePlacement,
  ShikakuPuzzle,
} from "@/lib/shikaku/types.ts";

export function createRectangleFromCorners(
  start: { row: number; col: number },
  end: { row: number; col: number },
): RectanglePlacement {
  const row = Math.min(start.row, end.row);
  const col = Math.min(start.col, end.col);
  const height = Math.abs(end.row - start.row) + 1;
  const width = Math.abs(end.col - start.col) + 1;

  return { row, col, width, height };
}

export function getRectangleCells(rectangle: RectanglePlacement): string[] {
  const cells: string[] = [];

  for (let row = rectangle.row; row < rectangle.row + rectangle.height; row++) {
    for (
      let col = rectangle.col;
      col < rectangle.col + rectangle.width;
      col++
    ) {
      cells.push(`${row},${col}`);
    }
  }

  return cells;
}

export function canonicalizeRectangle(rectangle: PlacedRectangle): string {
  return [
    rectangle.clueId,
    rectangle.row,
    rectangle.col,
    rectangle.width,
    rectangle.height,
    rectangle.value,
  ].join(":");
}

export function validateRectanglePlacement(
  puzzle: ShikakuPuzzle,
  candidate: RectanglePlacement,
  existing: PlacedRectangle[],
):
  | { ok: true; given: PuzzleGiven }
  | {
    ok: false;
    reason:
      | "out-of-bounds"
      | "wrong-area"
      | "missing-given"
      | "multiple-givens"
      | "overlap";
  } {
  if (
    candidate.row < 0 || candidate.col < 0 ||
    candidate.row + candidate.height > puzzle.height ||
    candidate.col + candidate.width > puzzle.width
  ) {
    return { ok: false, reason: "out-of-bounds" };
  }

  const area = candidate.width * candidate.height;
  const cells = new Set(getRectangleCells(candidate));
  const givens = puzzle.givens.filter((given) =>
    cells.has(`${given.row},${given.col}`)
  );

  if (givens.length === 0) {
    return { ok: false, reason: "missing-given" };
  }

  if (givens.length > 1) {
    return { ok: false, reason: "multiple-givens" };
  }

  if (givens[0].value !== area) {
    return { ok: false, reason: "wrong-area" };
  }

  const occupied = new Set(
    existing.flatMap((rectangle) => getRectangleCells(rectangle)),
  );
  for (const cell of cells) {
    if (occupied.has(cell)) {
      return { ok: false, reason: "overlap" };
    }
  }

  return { ok: true, given: givens[0] };
}

export function isPuzzleSolved(
  puzzle: ShikakuPuzzle,
  placed: PlacedRectangle[],
): boolean {
  if (placed.length !== puzzle.givens.length) return false;

  const covered = new Set<string>();
  const accepted: PlacedRectangle[] = [];

  for (const rectangle of placed) {
    const validation = validateRectanglePlacement(puzzle, rectangle, accepted);
    if (!validation.ok) return false;
    if (validation.given.id !== rectangle.clueId) return false;

    const cells = getRectangleCells(rectangle);
    for (const cell of cells) {
      covered.add(cell);
    }

    accepted.push(rectangle);
  }

  return covered.size === puzzle.width * puzzle.height;
}
