import { assertEquals } from "@std/assert";

import { getGridPointFromBoardPosition } from "@/lib/shikaku/interaction.ts";

Deno.test("getGridPointFromBoardPosition maps pointer coordinates into board cells", () => {
  const point = getGridPointFromBoardPosition(
    { left: 100, top: 200, width: 320, height: 320 },
    { clientX: 250, clientY: 360 },
    { rows: 8, cols: 8 },
  );

  assertEquals(point, { row: 4, col: 3 });
});

Deno.test("getGridPointFromBoardPosition clamps pointers that drift outside the board", () => {
  const point = getGridPointFromBoardPosition(
    { left: 100, top: 200, width: 320, height: 320 },
    { clientX: 500, clientY: 50 },
    { rows: 8, cols: 8 },
  );

  assertEquals(point, { row: 0, col: 7 });
});

Deno.test("getGridPointFromBoardPosition handles compact boards accurately", () => {
  const point = getGridPointFromBoardPosition(
    { left: 0, top: 0, width: 240, height: 160 },
    { clientX: 179, clientY: 119 },
    { rows: 4, cols: 6 },
  );

  assertEquals(point, { row: 2, col: 4 });
});
