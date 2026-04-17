import { useSignal } from "@preact/signals";
import { useEffect, useMemo, useRef } from "preact/hooks";

import { shouldReloadSavedProgress } from "@/lib/shikaku/game_session.ts";
import {
  createRectangleFromCorners,
  getRectangleCells,
  isPuzzleSolved,
  validateRectanglePlacement,
} from "@/lib/shikaku/engine.ts";
import { getGridPointFromBoardPosition } from "@/lib/shikaku/interaction.ts";
import { getClueSymbol } from "@/lib/shikaku/clue_symbol.ts";
import { getClueTone } from "@/lib/shikaku/clue_tone.ts";
import {
  canRemovePlacedRectangle,
  getStatusTone,
} from "@/lib/shikaku/play_state.ts";
import {
  loadPuzzleProgress,
  savePuzzleProgress,
} from "@/lib/storage/local_progress.ts";
import type {
  GridPoint,
  PlacedRectangle,
  PuzzleProgress,
  ShikakuPuzzle,
} from "@/lib/shikaku/types.ts";

interface ShikakuGameProps {
  puzzle: ShikakuPuzzle;
  readOnly?: boolean;
  resetEnabled?: boolean;
  lockedMessage?: string;
  initialMessage?: string;
  solvedMessage?: string;
  onReset?: () => void;
  onSolved?: () => void;
}

const COLORS = [
  "#fde68a",
  "#bfdbfe",
  "#bbf7d0",
  "#fbcfe8",
  "#ddd6fe",
  "#fecaca",
  "#fdba74",
  "#a7f3d0",
];

export default function ShikakuGame(props: ShikakuGameProps) {
  const {
    puzzle,
    readOnly = false,
    resetEnabled,
    lockedMessage = "View only.",
    initialMessage,
    solvedMessage = "Solved!",
    onReset,
    onSolved,
  } = props;
  const resolvedInitialMessage = initialMessage ??
    (readOnly
      ? lockedMessage
      : "Drag to size a rectangle. Release when it encloses one clue.");
  const resolvedResetEnabled = resetEnabled ?? !readOnly;

  const boardRef = useRef<HTMLDivElement>(null);
  const previousPuzzleIdRef = useRef("");
  const rectangles = useSignal<PlacedRectangle[]>([]);
  const activeClueId = useSignal<number | null>(null);
  const dragAnchor = useSignal<GridPoint | null>(null);
  const dragCurrent = useSignal<GridPoint | null>(null);
  const dragPointerId = useSignal<number | null>(null);
  const status = useSignal<"in_progress" | "solved">("in_progress");
  const message = useSignal(resolvedInitialMessage);
  const hydrated = useSignal(false);

  function persistProgress(
    nextRectangles: PlacedRectangle[],
    nextStatus: "in_progress" | "solved",
  ) {
    const now = new Date().toISOString();
    const progress: PuzzleProgress = {
      date: puzzle.date,
      puzzleId: puzzle.id,
      startedAt: now,
      updatedAt: now,
      status: nextStatus,
      elapsedMs: 0,
      mistakes: 0,
      selections: nextRectangles.map((rectangle) => ({
        clueId: rectangle.clueId,
        cells: getRectangleCells(rectangle),
        value: rectangle.value,
      })),
      notes: {},
      lastViewedAt: now,
      clientVersion: 1,
    };
    savePuzzleProgress(globalThis.localStorage, progress);
  }

  useEffect(() => {
    if (!shouldReloadSavedProgress(previousPuzzleIdRef.current, puzzle.id)) {
      return;
    }

    previousPuzzleIdRef.current = puzzle.id;
    const saved = loadPuzzleProgress(globalThis.localStorage, puzzle.id);
    rectangles.value = saved ? selectionsToRectangles(saved, puzzle) : [];
    status.value = saved?.status === "solved" ? "solved" : "in_progress";
    message.value = saved?.status === "solved"
      ? solvedMessage
      : resolvedInitialMessage;
    hydrated.value = true;
  }, [puzzle.id, resolvedInitialMessage, solvedMessage]);

  useEffect(() => {
    if (!hydrated.value || readOnly) return;
    persistProgress(rectangles.value, status.value);
  }, [puzzle.id, rectangles.value, status.value, hydrated.value, readOnly]);

  const clueEntries = useMemo(() => {
    return puzzle.givens.map((given, index) => {
      const rectangle = rectangles.value.find((item) =>
        item.clueId === given.id
      );
      return {
        given,
        color: COLORS[index % COLORS.length],
        placed: Boolean(rectangle),
        active: activeClueId.value === given.id,
      };
    });
  }, [puzzle.givens, rectangles.value, activeClueId.value]);

  const previewRectangle = dragAnchor.value && dragCurrent.value
    ? createRectangleFromCorners(dragAnchor.value, dragCurrent.value)
    : null;
  const previewCells = new Set(
    previewRectangle ? getRectangleCells(previewRectangle) : [],
  );

  function getContainingRectangle(point: GridPoint) {
    return rectangles.value.find((rectangle) =>
      point.row >= rectangle.row &&
      point.row < rectangle.row + rectangle.height &&
      point.col >= rectangle.col && point.col < rectangle.col + rectangle.width
    );
  }

  function getBoardPointFromPointer(event: PointerEvent): GridPoint | null {
    const board = boardRef.current;
    if (!board) return null;

    const rect = board.getBoundingClientRect();
    return getGridPointFromBoardPosition(
      {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      },
      { clientX: event.clientX, clientY: event.clientY },
      { rows: puzzle.height, cols: puzzle.width },
    );
  }

  function beginDrag(point: GridPoint, pointerId: number) {
    dragAnchor.value = point;
    dragCurrent.value = point;
    dragPointerId.value = pointerId;

    const startingClue = puzzle.givens.find((given) =>
      given.row === point.row && given.col === point.col
    );
    activeClueId.value = startingClue?.id ?? null;
    message.value =
      "Drag to size a rectangle. Release when it encloses one clue.";
  }

  function updateDrag(point: GridPoint, pointerId: number) {
    if (dragPointerId.value !== pointerId || !dragAnchor.value) return;
    dragCurrent.value = point;

    const candidate = createRectangleFromCorners(dragAnchor.value, point);
    const cells = new Set(getRectangleCells(candidate));
    const enclosedClues = puzzle.givens.filter((given) =>
      cells.has(`${given.row},${given.col}`)
    );
    activeClueId.value = enclosedClues.length === 1
      ? enclosedClues[0].id
      : null;
  }

  function clearDrag() {
    dragAnchor.value = null;
    dragCurrent.value = null;
    dragPointerId.value = null;
    activeClueId.value = null;
  }

  function commitDrag(point: GridPoint, pointerId: number) {
    if (dragPointerId.value !== pointerId || !dragAnchor.value) return;

    const candidate = createRectangleFromCorners(dragAnchor.value, point);
    const activeRectangle = getContainingRectangle(dragAnchor.value);
    const existingWithoutActive = activeRectangle
      ? rectangles.value.filter((rectangle) => rectangle !== activeRectangle)
      : rectangles.value;

    const validation = validateRectanglePlacement(
      puzzle,
      candidate,
      existingWithoutActive,
    );
    clearDrag();

    if (!validation.ok) {
      message.value = humanizeValidation(validation.reason);
      return;
    }

    const nextRectangle: PlacedRectangle = {
      clueId: validation.given.id,
      ...candidate,
      value: validation.given.value,
    };

    const nextRectangles = [...existingWithoutActive, nextRectangle];
    rectangles.value = nextRectangles;

    if (isPuzzleSolved(puzzle, nextRectangles)) {
      status.value = "solved";
      persistProgress(nextRectangles, "solved");
      message.value = solvedMessage;
      onSolved?.();
      return;
    }

    message.value = "Rectangle placed.";
  }

  function handleCellPointerDown(point: GridPoint, pointerId: number) {
    if (readOnly) {
      message.value = lockedMessage;
      clearDrag();
      return;
    }

    const containing = getContainingRectangle(point);
    if (containing) {
      if (!canRemovePlacedRectangle(status.value)) {
        message.value = "Solved board locked.";
        clearDrag();
        return;
      }

      rectangles.value = rectangles.value.filter((rectangle) =>
        rectangle !== containing
      );
      if (status.value === "solved") status.value = "in_progress";
      clearDrag();
      message.value = "Removed region.";
      return;
    }

    beginDrag(point, pointerId);
  }

  function handleBoardPointerDown(event: PointerEvent) {
    if (readOnly) return;
    event.preventDefault();
    const point = getBoardPointFromPointer(event);
    if (!point) return;

    boardRef.current?.setPointerCapture?.(event.pointerId);
    handleCellPointerDown(point, event.pointerId);
  }

  function handleBoardPointerMove(event: PointerEvent) {
    if (readOnly) return;
    const point = getBoardPointFromPointer(event);
    if (!point) return;
    updateDrag(point, event.pointerId);
  }

  function handleBoardPointerUp(event: PointerEvent) {
    if (readOnly) return;
    event.preventDefault();
    const point = getBoardPointFromPointer(event);
    if (!point) {
      clearDrag();
      return;
    }

    commitDrag(point, event.pointerId);
    boardRef.current?.releasePointerCapture?.(event.pointerId);
  }

  function handleBoardPointerCancel(event: PointerEvent) {
    if (readOnly) return;
    clearDrag();
    boardRef.current?.releasePointerCapture?.(event.pointerId);
  }

  function clearBoard() {
    if (readOnly) {
      if (!resolvedResetEnabled) {
        message.value = lockedMessage;
        return;
      }
      onReset?.();
      return;
    }

    rectangles.value = [];
    clearDrag();
    status.value = "in_progress";
    message.value = "Board cleared.";
    onReset?.();
  }

  return (
    <section class="shikaku-game-shell">
      <div
        class={`shikaku-game-status shikaku-game-status--${
          getStatusTone(status.value)
        }`}
      >
        <div class="shikaku-game-status__meta">
          <strong>
            {status.value === "solved" ? "Solved" : "In progress"}
          </strong>
          <span>{message}</span>
        </div>
        <div class="shikaku-game-actions">
          <button
            class="shikaku-game-clear"
            type="button"
            onClick={clearBoard}
            disabled={readOnly && !resolvedResetEnabled}
            aria-disabled={readOnly && !resolvedResetEnabled}
          >
            Reset
          </button>
        </div>
      </div>

      <div class="shikaku-game-board-wrap">
        <div
          ref={boardRef}
          class="shikaku-board shikaku-board--fixed"
          style={{
            gridTemplateColumns: `repeat(${puzzle.width}, minmax(0, 1fr))`,
          }}
          onContextMenu={(event) => event.preventDefault()}
          onPointerDown={handleBoardPointerDown}
          onPointerMove={handleBoardPointerMove}
          onPointerUp={handleBoardPointerUp}
          onPointerCancel={handleBoardPointerCancel}
        >
          {Array.from({ length: puzzle.height * puzzle.width }, (_, index) => {
            const row = Math.floor(index / puzzle.width);
            const col = index % puzzle.width;
            const given = puzzle.givens.find((item) =>
              item.row === row && item.col === col
            );
            const rectangleIndex = rectangles.value.findIndex((rectangle) =>
              row >= rectangle.row &&
              row < rectangle.row + rectangle.height &&
              col >= rectangle.col &&
              col < rectangle.col + rectangle.width
            );
            const isActive = given ? activeClueId.value === given.id : false;
            const isPreview = previewCells.has(`${row},${col}`);
            const background = rectangleIndex >= 0
              ? COLORS[rectangles.value[rectangleIndex].clueId % COLORS.length]
              : isPreview
              ? "#dbeafe"
              : "#fffdf8";

            return (
              <button
                type="button"
                key={`${row}-${col}`}
                data-row={row}
                data-col={col}
                class="shikaku-board__cell"
                style={{
                  background,
                  outline: isActive ? "3px solid #2563eb" : "none",
                  outlineOffset: "-3px",
                }}
              >
                {given ? given.value : ""}
              </button>
            );
          })}
        </div>
      </div>

      <div class="shikaku-clue-strip" aria-label="Clue legend">
        {clueEntries.map((entry) => (
          <button
            key={entry.given.id}
            type="button"
            class={`shikaku-clue-token shikaku-clue-token--${
              getClueTone(entry.placed)
            }${entry.placed ? " is-placed" : ""}${
              entry.active ? " is-active" : ""
            }`}
            style={{ ["--token-color" as string]: entry.color }}
            onClick={() => {
              if (readOnly) {
                message.value = lockedMessage;
                return;
              }
              activeClueId.value = entry.given.id;
              message.value = `Clue ${entry.given.value} highlighted on board.`;
            }}
            aria-label={`Clue ${entry.given.value} at row ${
              entry.given.row + 1
            }, col ${entry.given.col + 1}`}
          >
            <span class="shikaku-clue-token__symbol" aria-hidden="true">
              {getClueSymbol(entry.given.value)}
            </span>
            <span class="shikaku-clue-token__value">{entry.given.value}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function selectionsToRectangles(
  progress: PuzzleProgress,
  puzzle: ShikakuPuzzle,
): PlacedRectangle[] {
  return progress.selections.map((selection) => {
    const coordinates = selection.cells.map(parseCell);
    const rows = coordinates.map((cell) => cell.row);
    const cols = coordinates.map((cell) => cell.col);
    const row = Math.min(...rows);
    const col = Math.min(...cols);
    const height = Math.max(...rows) - row + 1;
    const width = Math.max(...cols) - col + 1;
    const clueId = selection.clueId >= 0
      ? selection.clueId
      : puzzle.givens.find((given) =>
        given.row >= row && given.row < row + height && given.col >= col &&
        given.col < col + width && given.value === selection.value
      )?.id ?? -1;

    return { clueId, row, col, width, height, value: selection.value };
  }).filter((rectangle) => rectangle.clueId >= 0);
}

function parseCell(cell: string): GridPoint {
  const [row, col] = cell.split(",").map(Number);
  return { row, col };
}

function humanizeValidation(reason: string): string {
  switch (reason) {
    case "out-of-bounds":
      return "Outside the board.";
    case "wrong-area":
      return "Area must match the clue.";
    case "missing-given":
      return "Need one clue inside.";
    case "multiple-givens":
      return "Only one clue per region.";
    case "overlap":
      return "Regions cannot overlap.";
    default:
      return "That move is not valid.";
  }
}
