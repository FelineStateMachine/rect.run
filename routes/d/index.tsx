import { dateToSlug } from "@/lib/date/daily.ts";
import { define } from "../../utils.ts";
import DailyStackRedirect from "../../islands/DailyStackRedirect.tsx";

export default define.page(function DailyEntry() {
  const fallbackDate = dateToSlug(new Date());

  return <DailyStackRedirect fallbackDate={fallbackDate} />;
});
