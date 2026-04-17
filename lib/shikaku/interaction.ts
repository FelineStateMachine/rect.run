import type { GridPoint } from "@/lib/shikaku/types.ts";

interface BoardRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface PointerPosition {
  clientX: number;
  clientY: number;
}

interface BoardDimensions {
  rows: number;
  cols: number;
}

export function getGridPointFromBoardPosition(
  rect: BoardRect,
  pointer: PointerPosition,
  dimensions: BoardDimensions,
): GridPoint {
  const relativeX = clamp(pointer.clientX - rect.left, 0, rect.width - 1);
  const relativeY = clamp(pointer.clientY - rect.top, 0, rect.height - 1);

  const col = Math.floor((relativeX / rect.width) * dimensions.cols);
  const row = Math.floor((relativeY / rect.height) * dimensions.rows);

  return {
    row: clamp(row, 0, dimensions.rows - 1),
    col: clamp(col, 0, dimensions.cols - 1),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
