import { assertEquals } from "@std/assert";

import {
  buildDailyPath,
  buildLegacyDailyPath,
  buildShareDailyStackText,
  isDailyPathname,
  resolvePlayableDailyPath,
} from "@/lib/site/paths.ts";

class MemoryStorage implements Pick<Storage, "length" | "key" | "getItem"> {
  #data = new Map<string, string>();

  get length(): number {
    return this.#data.size;
  }

  getItem(key: string): string | null {
    return this.#data.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.#data.keys()][index] ?? null;
  }

  set(key: string, value: string): void {
    this.#data.set(key, value);
  }
}

Deno.test("buildDailyPath uses the /d/date/index format", () => {
  assertEquals(buildDailyPath(), "/d");
  assertEquals(buildDailyPath("2026-04-17", 0), "/d/2026-04-17/0");
  assertEquals(buildDailyPath("2026-04-17", 4), "/d/2026-04-17/4");
});

Deno.test("buildLegacyDailyPath keeps /daily redirects available", () => {
  assertEquals(buildLegacyDailyPath(), "/daily");
  assertEquals(buildLegacyDailyPath("2026-04-17"), "/daily/2026-04-17");
});

Deno.test("buildShareDailyStackText returns a plain share string", () => {
  assertEquals(
    buildShareDailyStackText("https://rect.run", "2026-04-17", 0),
    "Daily stack · https://rect.run/d/2026-04-17/0",
  );
});

Deno.test("resolvePlayableDailyPath uses the unlocked stack for the day", () => {
  const storage = new MemoryStorage();
  storage.set(
    "shikaku:v1:progress:daily-2026-04-17-0",
    JSON.stringify({
      date: "2026-04-17",
      puzzleId: "daily-2026-04-17-0",
      startedAt: "2026-04-17T10:00:00.000Z",
      updatedAt: "2026-04-17T10:03:00.000Z",
      status: "solved",
      elapsedMs: 180000,
      mistakes: 0,
      selections: [],
      notes: {},
      lastViewedAt: "2026-04-17T10:03:00.000Z",
      clientVersion: 1,
    }),
  );

  assertEquals(
    resolvePlayableDailyPath(storage, "2026-04-17"),
    "/d/2026-04-17/1",
  );
  assertEquals(
    resolvePlayableDailyPath(storage, "2026-04-18"),
    "/d/2026-04-18/0",
  );
});

Deno.test("isDailyPathname recognizes both current and legacy daily routes", () => {
  assertEquals(isDailyPathname("/d"), true);
  assertEquals(isDailyPathname("/d/2026-04-17/0"), true);
  assertEquals(isDailyPathname("/daily"), true);
  assertEquals(isDailyPathname("/daily/2026-04-17"), true);
  assertEquals(isDailyPathname("/"), false);
});
