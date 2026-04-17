import { assertEquals } from "@std/assert";

import { buildInitialDailyControllerState } from "@/lib/shikaku/daily_controller_state.ts";

Deno.test("buildInitialDailyControllerState opens today's top unlocked stack", () => {
  assertEquals(
    buildInitialDailyControllerState({
      date: "2026-04-17",
      today: "2026-04-17",
      selectedStackIndex: 0,
      playableStackIndex: 2,
      visibleMaxStack: 1,
    }),
    {
      selectedStack: 2,
      playableStack: 2,
      visibleMaxStack: 2,
    },
  );
});

Deno.test("buildInitialDailyControllerState keeps past dates on their saved top stack", () => {
  assertEquals(
    buildInitialDailyControllerState({
      date: "2026-04-16",
      today: "2026-04-17",
      selectedStackIndex: 2,
      playableStackIndex: 0,
      visibleMaxStack: 2,
    }),
    {
      selectedStack: 2,
      playableStack: 0,
      visibleMaxStack: 2,
    },
  );
});
