import { listAvailablePuzzleDates } from "@/lib/shikaku/catalog.ts";
import { buildDailyPath } from "@/lib/site/paths.ts";
import { define } from "../../utils.ts";

export const handler = define.handlers((ctx) => {
  const dates = listAvailablePuzzleDates();
  const latest = dates.at(-1);

  if (!latest) {
    return new Response("No puzzles available", { status: 404 });
  }

  return ctx.redirect(buildDailyPath(latest));
});
