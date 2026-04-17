import type {
  PlacedRectangle,
  PuzzleGiven,
  ShikakuPuzzle,
} from "@/lib/shikaku/types.ts";

interface GeneratorOptions {
  width: number;
  height: number;
  maxRectSize: number;
}

interface RectTemplate {
  width: number;
  height: number;
}

interface GeneratedPartition {
  row: number;
  col: number;
  width: number;
  height: number;
}

const DEFAULT_OPTIONS: GeneratorOptions = {
  width: 8,
  height: 8,
  maxRectSize: 8,
};

const MAX_GENERATE_ATTEMPTS = 100;

export function createSeededRng(seed: string): () => number {
  let hash = 1779033703 ^ seed.length;

  for (let index = 0; index < seed.length; index++) {
    hash = Math.imul(hash ^ seed.charCodeAt(index), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }

  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    hash ^= hash >>> 16;
    return (hash >>> 0) / 4294967296;
  };
}

export function createPuzzleFromDailySeed(
  date: string,
  options: Partial<GeneratorOptions> = {},
): ShikakuPuzzle {
  const puzzle = generatePuzzleFromSeed(date, options);
  return {
    ...puzzle,
    id: `daily-${date}`,
    date,
  };
}

export function generatePuzzleFromSeed(
  seed: string,
  options: Partial<GeneratorOptions> = {},
): ShikakuPuzzle {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const rng = createSeededRng(seed);

  for (let attempt = 0; attempt < MAX_GENERATE_ATTEMPTS; attempt++) {
    const partitions = tryGeneratePartitions(config, rng);
    if (!partitions) continue;

    const givens: PuzzleGiven[] = [];
    const solution: PlacedRectangle[] = [];
    let allSingles = true;

    partitions.forEach((partition, index) => {
      const clueCol = partition.col + randomInt(rng, partition.width);
      const clueRow = partition.row + randomInt(rng, partition.height);
      const value = partition.width * partition.height;
      if (value > 1) allSingles = false;

      givens.push({
        id: index,
        row: clueRow,
        col: clueCol,
        value,
      });

      solution.push({
        clueId: index,
        row: partition.row,
        col: partition.col,
        width: partition.width,
        height: partition.height,
        value,
      });
    });

    if (allSingles) continue;

    return {
      id: `seed-${seed}`,
      date: seed,
      width: config.width,
      height: config.height,
      givens,
      solution,
      difficulty: classifyDifficulty(config.maxRectSize),
      seed,
    };
  }

  throw new Error("Failed to generate shikaku puzzle from seed");
}

function tryGeneratePartitions(
  options: GeneratorOptions,
  rng: () => number,
): GeneratedPartition[] | null {
  const grid = makeGrid(options.width, options.height, -1);
  const partitions: GeneratedPartition[] = [];
  const templateCache = new Map<string, RectTemplate[]>();
  const failedStates = new Set<string>();

  const ok = partitionGridRec(
    grid,
    options,
    partitions,
    rng,
    templateCache,
    failedStates,
    options.width * options.height,
  );

  return ok ? partitions : null;
}

function partitionGridRec(
  grid: number[][],
  options: GeneratorOptions,
  partitions: GeneratedPartition[],
  rng: () => number,
  templateCache: Map<string, RectTemplate[]>,
  failedStates: Set<string>,
  remaining: number,
): boolean {
  const anchor = selectMostConstrainedAnchor(grid, options, templateCache);
  if (!anchor) return true;
  if (anchor.candidates.length === 0) {
    failedStates.add(
      failedKey(
        anchor.row,
        anchor.col,
        anchor.maxWidth,
        anchor.maxHeight,
        remaining,
      ),
    );
    return false;
  }

  const failState = failedKey(
    anchor.row,
    anchor.col,
    anchor.maxWidth,
    anchor.maxHeight,
    remaining,
  );
  if (failedStates.has(failState)) {
    return false;
  }

  const order = [...anchor.candidates];
  shuffle(order, rng);

  const partitionId = partitions.length;
  for (const candidate of order) {
    place(
      grid,
      anchor.row,
      anchor.col,
      candidate.width,
      candidate.height,
      partitionId,
    );
    partitions.push({
      row: anchor.row,
      col: anchor.col,
      width: candidate.width,
      height: candidate.height,
    });

    if (
      partitionGridRec(
        grid,
        options,
        partitions,
        rng,
        templateCache,
        failedStates,
        remaining - candidate.width * candidate.height,
      )
    ) {
      return true;
    }

    partitions.pop();
    clear(grid, anchor.row, anchor.col, candidate.width, candidate.height);
  }

  failedStates.add(failState);
  return false;
}

function selectMostConstrainedAnchor(
  grid: number[][],
  options: GeneratorOptions,
  templateCache: Map<string, RectTemplate[]>,
): {
  row: number;
  col: number;
  maxWidth: number;
  maxHeight: number;
  candidates: RectTemplate[];
} | null {
  let best:
    | {
      row: number;
      col: number;
      maxWidth: number;
      maxHeight: number;
      candidates: RectTemplate[];
    }
    | null = null;

  for (let row = 0; row < options.height; row++) {
    for (let col = 0; col < options.width; col++) {
      if (!isAnchorCell(grid, row, col)) continue;

      const [maxWidth, maxHeight] = anchorExtents(
        grid,
        row,
        col,
        options.width,
        options.height,
      );
      const templates = candidateTemplatesForAnchor(
        row,
        col,
        maxWidth,
        maxHeight,
        options.maxRectSize,
        templateCache,
      );
      const candidates = templates.filter((template) =>
        fits(grid, row, col, template.width, template.height)
      );

      if (!best || candidates.length < best.candidates.length) {
        best = { row, col, maxWidth, maxHeight, candidates };
      }

      if (best && best.candidates.length <= 1) {
        return best;
      }
    }
  }

  return best;
}

function candidateTemplatesForAnchor(
  row: number,
  col: number,
  maxWidth: number,
  maxHeight: number,
  maxRectSize: number,
  templateCache: Map<string, RectTemplate[]>,
): RectTemplate[] {
  const key = `${row}:${col}:${maxWidth}:${maxHeight}:${maxRectSize}`;
  const cached = templateCache.get(key);
  if (cached) return cached;

  const templates: RectTemplate[] = [];
  for (let width = 1; width <= maxWidth; width++) {
    for (let height = 1; height <= maxHeight; height++) {
      if (width * height > maxRectSize) continue;
      templates.push({ width, height });
    }
  }

  templateCache.set(key, templates);
  return templates;
}

function anchorExtents(
  grid: number[][],
  row: number,
  col: number,
  width: number,
  height: number,
): [number, number] {
  let maxWidth = 0;
  for (
    let currentCol = col;
    currentCol < width && grid[row][currentCol] === -1;
    currentCol++
  ) {
    maxWidth++;
  }

  let maxHeight = 0;
  for (
    let currentRow = row;
    currentRow < height && grid[currentRow][col] === -1;
    currentRow++
  ) {
    maxHeight++;
  }

  return [maxWidth, maxHeight];
}

function isAnchorCell(grid: number[][], row: number, col: number): boolean {
  if (grid[row][col] !== -1) return false;
  if (col > 0 && grid[row][col - 1] === -1) return false;
  if (row > 0 && grid[row - 1][col] === -1) return false;
  return true;
}

function fits(
  grid: number[][],
  row: number,
  col: number,
  width: number,
  height: number,
): boolean {
  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      if (grid[row + dy][col + dx] !== -1) {
        return false;
      }
    }
  }

  return true;
}

function place(
  grid: number[][],
  row: number,
  col: number,
  width: number,
  height: number,
  id: number,
): void {
  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      grid[row + dy][col + dx] = id;
    }
  }
}

function clear(
  grid: number[][],
  row: number,
  col: number,
  width: number,
  height: number,
): void {
  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      grid[row + dy][col + dx] = -1;
    }
  }
}

function makeGrid(width: number, height: number, fill: number): number[][] {
  return Array.from(
    { length: height },
    () => Array.from({ length: width }, () => fill),
  );
}

function shuffle<T>(values: T[], rng: () => number): void {
  for (let index = values.length - 1; index > 0; index--) {
    const swapIndex = randomInt(rng, index + 1);
    [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
  }
}

function randomInt(rng: () => number, maxExclusive: number): number {
  return Math.floor(rng() * maxExclusive);
}

function failedKey(
  row: number,
  col: number,
  maxWidth: number,
  maxHeight: number,
  remaining: number,
): string {
  return `${row}:${col}:${maxWidth}:${maxHeight}:${remaining}`;
}

function classifyDifficulty(maxRectSize: number): "easy" | "medium" | "hard" {
  if (maxRectSize <= 6) return "easy";
  if (maxRectSize <= 10) return "medium";
  return "hard";
}
