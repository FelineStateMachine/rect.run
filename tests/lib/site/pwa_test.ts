import { assertEquals, assertStringIncludes } from "@std/assert";

import {
  PWA_CORE_PATHS,
  SERVICE_WORKER_PATH,
  SERVICE_WORKER_REGISTER_PATH,
} from "@/lib/site/pwa.ts";

Deno.test("pwa exports stable service worker paths", () => {
  assertEquals(SERVICE_WORKER_PATH, "/sw.js");
  assertEquals(SERVICE_WORKER_REGISTER_PATH, "/register-sw.js");
});

Deno.test("pwa core paths include the homepage, daily entry, and install assets", () => {
  assertEquals(PWA_CORE_PATHS.includes("/"), true);
  assertEquals(PWA_CORE_PATHS.includes("/d"), true);
  assertEquals(PWA_CORE_PATHS.includes("/site.webmanifest"), true);
  assertEquals(PWA_CORE_PATHS.includes("/icon-192.png"), true);
  assertEquals(PWA_CORE_PATHS.includes("/apple-touch-icon.png"), true);
  for (const path of PWA_CORE_PATHS) {
    assertStringIncludes(path, "/");
  }
});
