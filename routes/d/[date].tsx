import { DAILY_STREAK_START_DATE } from "@/lib/shikaku/catalog.ts";
import { define } from "../../utils.ts";
import DailyDateController from "../../islands/DailyDateController.tsx";

export const handler = define.handlers((ctx) => {
  const date = ctx.params.date;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < DAILY_STREAK_START_DATE) {
    return new Response("Puzzle not found", { status: 404 });
  }

  return { data: { date } };
});

export default define.page<typeof handler>(({ data }) => {
  return <DailyDateController date={data.date} />;
});
