import { assertEquals } from "@std/assert";

import { shouldReloadSavedProgress } from "@/lib/shikaku/game_session.ts";

Deno.test("shouldReloadSavedProgress only reloads when the puzzle changes", () => {
  assertEquals(
    shouldReloadSavedProgress("daily-2026-04-16-0", "daily-2026-04-16-0"),
    false,
  );
  assertEquals(
    shouldReloadSavedProgress("daily-2026-04-16-0", "daily-2026-04-16-1"),
    true,
  );
});
