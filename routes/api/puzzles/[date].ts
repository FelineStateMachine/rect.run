import { getPuzzleByDate } from "@/lib/shikaku/catalog.ts";
import { define } from "../../../utils.ts";

export const handler = define.handlers((ctx) => {
  const puzzle = getPuzzleByDate(ctx.params.date);
  if (!puzzle) {
    return Response.json({ error: "Puzzle not found" }, { status: 404 });
  }

  return Response.json({ puzzle });
});
