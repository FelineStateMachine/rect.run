import { buildDailyPath } from "@/lib/site/paths.ts";
import { define } from "../../utils.ts";

export const handler = define.handlers((ctx) => {
  return ctx.redirect(buildDailyPath());
});
