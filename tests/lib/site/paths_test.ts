import { assertEquals } from "@std/assert";

import {
  buildDailyPath,
  buildLegacyDailyPath,
  isDailyPathname,
} from "@/lib/site/paths.ts";

Deno.test("buildDailyPath uses the /d prefix", () => {
  assertEquals(buildDailyPath(), "/d");
  assertEquals(buildDailyPath("2026-04-17"), "/d/2026-04-17");
});

Deno.test("buildLegacyDailyPath keeps /daily redirects available", () => {
  assertEquals(buildLegacyDailyPath(), "/daily");
  assertEquals(buildLegacyDailyPath("2026-04-17"), "/daily/2026-04-17");
});

Deno.test("isDailyPathname recognizes both current and legacy daily routes", () => {
  assertEquals(isDailyPathname("/d"), true);
  assertEquals(isDailyPathname("/d/2026-04-17"), true);
  assertEquals(isDailyPathname("/daily"), true);
  assertEquals(isDailyPathname("/daily/2026-04-17"), true);
  assertEquals(isDailyPathname("/"), false);
});
