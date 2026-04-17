export const CURRENT_STORAGE_VERSION = 1;

export type PuzzleStatus = "in_progress" | "solved" | "gave_up";
export type ArchivedPuzzleStatus = "solved" | "gave_up" | "expired_unsolved";

export interface CellSelection {
  clueId: number;
  cells: string[];
  value: number;
}

export interface UserSettings {
  theme: "system" | "light" | "dark";
  reducedMotion: boolean;
  hapticsEnabled: boolean;
  handedness: "left" | "right";
  showRegionHints: boolean;
}

export interface GridPoint {
  row: number;
  col: number;
}

export interface PuzzleGiven extends GridPoint {
  id: number;
  value: number;
}

export interface RectanglePlacement extends GridPoint {
  width: number;
  height: number;
}

export interface PlacedRectangle extends RectanglePlacement {
  clueId: number;
  value: number;
}

export interface ShikakuPuzzle {
  id: string;
  date: string;
  streakIndex: number;
  width: number;
  height: number;
  givens: PuzzleGiven[];
  solution?: PlacedRectangle[];
  difficulty: "easy" | "medium" | "hard";
  seed: string;
}

export interface PuzzleProgress {
  date: string;
  puzzleId: string;
  startedAt: string;
  updatedAt: string;
  status: PuzzleStatus;
  elapsedMs: number;
  mistakes: number;
  selections: CellSelection[];
  notes: Record<string, string>;
  lastViewedAt: string;
  clientVersion: number;
}

export interface PuzzleHistoryEntry {
  date: string;
  puzzleId: string;
  status: ArchivedPuzzleStatus;
  completedAt?: string;
  elapsedMs?: number;
  mistakes: number;
  score?: number;
}

export interface PlayerStats {
  played: number;
  solved: number;
  currentStreak: number;
  bestStreak: number;
  averageSolveMs?: number;
  lastPlayedDate?: string;
}

export function createDefaultSettings(): UserSettings {
  return {
    theme: "system",
    reducedMotion: false,
    hapticsEnabled: true,
    handedness: "right",
    showRegionHints: true,
  };
}

export function parsePuzzleProgress(value: unknown): PuzzleProgress | null {
  if (!isRecord(value)) return null;
  if (!isString(value.date) || !isString(value.puzzleId)) return null;
  if (!isString(value.startedAt) || !isString(value.updatedAt)) return null;
  if (!isPuzzleStatus(value.status)) return null;
  if (
    typeof value.elapsedMs !== "number" || typeof value.mistakes !== "number"
  ) {
    return null;
  }
  if (!Array.isArray(value.selections) || !isRecord(value.notes)) return null;
  if (!isString(value.lastViewedAt)) return null;

  return {
    date: value.date,
    puzzleId: value.puzzleId,
    startedAt: value.startedAt,
    updatedAt: value.updatedAt,
    status: value.status,
    elapsedMs: value.elapsedMs,
    mistakes: value.mistakes,
    selections: value.selections.map((selection) => {
      if (
        !isRecord(selection) || !Array.isArray(selection.cells) ||
        typeof selection.value !== "number"
      ) {
        return { clueId: -1, cells: [], value: 0 };
      }
      return {
        clueId: typeof selection.clueId === "number" ? selection.clueId : -1,
        cells: selection.cells.filter(isString),
        value: selection.value,
      };
    }),
    notes: Object.fromEntries(
      Object.entries(value.notes).filter((entry): entry is [string, string] =>
        typeof entry[1] === "string"
      ),
    ),
    lastViewedAt: value.lastViewedAt,
    clientVersion: typeof value.clientVersion === "number"
      ? value.clientVersion
      : CURRENT_STORAGE_VERSION,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isPuzzleStatus(value: unknown): value is PuzzleStatus {
  return value === "in_progress" || value === "solved" || value === "gave_up";
}
