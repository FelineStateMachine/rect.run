import { assertEquals } from "@std/assert";

import {
  getInitialStackIndex,
  resolveDayStackState,
} from "@/lib/shikaku/day_stack_state.ts";

Deno.test("resolveDayStackState allows play on today's unlocked stack", () => {
  assertEquals(
    resolveDayStackState({
      date: "2026-04-16",
      today: "2026-04-16",
      stackIndex: 2,
      playableStackIndex: 2,
      mostRecentStackIndex: 2,
      isReplay: false,
    }),
    { mode: "playable", message: "Drag. One clue.", canReset: true },
  );
});

Deno.test("resolveDayStackState keeps earlier stacks read-only on today", () => {
  assertEquals(
    resolveDayStackState({
      date: "2026-04-16",
      today: "2026-04-16",
      stackIndex: 1,
      playableStackIndex: 3,
      mostRecentStackIndex: 3,
      isReplay: false,
    }),
    { mode: "readonly", message: "Earlier stack. View only.", canReset: false },
  );
});

Deno.test("resolveDayStackState locks future days", () => {
  assertEquals(
    resolveDayStackState({
      date: "2026-04-17",
      today: "2026-04-16",
      stackIndex: 0,
      playableStackIndex: 0,
      mostRecentStackIndex: 0,
      isReplay: false,
    }),
    { mode: "locked", message: "Locked until this day.", canReset: false },
  );
});

Deno.test("resolveDayStackState keeps past days readonly until replay is requested", () => {
  assertEquals(
    resolveDayStackState({
      date: "2026-04-15",
      today: "2026-04-16",
      stackIndex: 2,
      playableStackIndex: 0,
      mostRecentStackIndex: 2,
      isReplay: false,
    }),
    { mode: "readonly", message: "Past day. View only.", canReset: true },
  );
});

Deno.test("resolveDayStackState allows replay after reset on a past day", () => {
  assertEquals(
    resolveDayStackState({
      date: "2026-04-15",
      today: "2026-04-16",
      stackIndex: 2,
      playableStackIndex: 0,
      mostRecentStackIndex: 2,
      isReplay: true,
    }),
    { mode: "playable", message: "Replay mode.", canReset: true },
  );
});

Deno.test("getInitialStackIndex loads the unlocked top stack for today", () => {
  assertEquals(
    getInitialStackIndex({
      date: "2026-04-17",
      today: "2026-04-17",
      selectedStackIndex: 0,
      playableStackIndex: 2,
    }),
    2,
  );
});

Deno.test("getInitialStackIndex keeps the saved top stack for past days", () => {
  assertEquals(
    getInitialStackIndex({
      date: "2026-04-16",
      today: "2026-04-17",
      selectedStackIndex: 2,
      playableStackIndex: 0,
    }),
    2,
  );
});
