import { assertEquals } from "@std/assert";

import { getOfflineBadgeLabel } from "@/lib/site/network.ts";

Deno.test("getOfflineBadgeLabel only shows a badge when offline", () => {
  assertEquals(getOfflineBadgeLabel(true), null);
  assertEquals(getOfflineBadgeLabel(false), "Offline");
});
