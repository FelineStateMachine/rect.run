import { assertEquals } from "@std/assert";

import {
  buildDailyPath,
  buildLegacyDailyPath,
  buildShareDailyStackText,
  isDailyPathname,
} from "@/lib/site/paths.ts";

Deno.test("buildDailyPath uses the /d/date format without stack indexes", () => {
  assertEquals(buildDailyPath(), "/d");
  assertEquals(buildDailyPath("2026-04-17"), "/d/2026-04-17");
});

Deno.test("buildLegacyDailyPath keeps /daily redirects available", () => {
  assertEquals(buildLegacyDailyPath(), "/daily");
  assertEquals(buildLegacyDailyPath("2026-04-17"), "/daily/2026-04-17");
});

Deno.test("buildShareDailyStackText returns compact text plus a link on a new line", () => {
  assertEquals(
    buildShareDailyStackText("https://rect.run", "2026-04-17", 3),
    "Stack 4\nhttps://rect.run/d/2026-04-17",
  );
});

Deno.test("isDailyPathname recognizes date-only daily routes", () => {
  assertEquals(isDailyPathname("/d"), true);
  assertEquals(isDailyPathname("/d/2026-04-17"), true);
  assertEquals(isDailyPathname("/d/2026-04-17/3"), true);
  assertEquals(isDailyPathname("/daily"), true);
  assertEquals(isDailyPathname("/daily/2026-04-17"), true);
  assertEquals(isDailyPathname("/"), false);
});
