import { assertEquals } from "@std/assert";

import { getClueSymbol } from "@/lib/shikaku/clue_symbol.ts";

Deno.test("getClueSymbol returns a stable size-based symbol for clue values", () => {
  assertEquals(getClueSymbol(1), "•");
  assertEquals(getClueSymbol(2), "▬");
  assertEquals(getClueSymbol(3), "▲");
  assertEquals(getClueSymbol(4), "■");
  assertEquals(getClueSymbol(8), "⬣");
});

Deno.test("getClueSymbol falls back to a default mark for unsupported sizes", () => {
  assertEquals(getClueSymbol(0), "◆");
  assertEquals(getClueSymbol(99), "◆");
});
