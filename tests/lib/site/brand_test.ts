import { assertEquals, assertMatch } from "@std/assert";

import {
  buildPageTitle,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_SHORT_NAME,
  SITE_THEME_COLOR,
} from "@/lib/site/brand.ts";

Deno.test("brand exports stable publication metadata", () => {
  assertEquals(SITE_NAME, "rect.run");
  assertEquals(SITE_SHORT_NAME, "rect.run");
  assertEquals(SITE_THEME_COLOR, "#122411");
  assertMatch(SITE_DESCRIPTION, /daily/i);
});

Deno.test("buildPageTitle prefixes page labels with the site name", () => {
  assertEquals(buildPageTitle(), "rect.run");
  assertEquals(buildPageTitle("Daily Puzzle"), "Daily Puzzle · rect.run");
});
