import { assertEquals } from "@std/assert";

import {
  canRemovePlacedRectangle,
  getStatusTone,
} from "@/lib/shikaku/play_state.ts";

Deno.test("canRemovePlacedRectangle allows removal only while puzzle is in progress", () => {
  assertEquals(canRemovePlacedRectangle("in_progress"), true);
  assertEquals(canRemovePlacedRectangle("solved"), false);
});

Deno.test("getStatusTone returns success tone for solved puzzles", () => {
  assertEquals(getStatusTone("in_progress"), "default");
  assertEquals(getStatusTone("solved"), "solved");
});
