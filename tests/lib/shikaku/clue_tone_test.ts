import { assertEquals } from "@std/assert";

import { getClueTone } from "@/lib/shikaku/clue_tone.ts";

Deno.test("getClueTone dims unmet clues and keeps met clues full strength", () => {
  assertEquals(getClueTone(true), "met");
  assertEquals(getClueTone(false), "dim");
});
