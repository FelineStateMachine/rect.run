import { useEffect, useState } from "preact/hooks";

import { dateToSlug } from "@/lib/date/daily.ts";
import { buildDailyPath } from "@/lib/site/paths.ts";

interface DailyStackLinkProps {
  fallbackDate: string;
}

export default function DailyStackLink({ fallbackDate }: DailyStackLinkProps) {
  const [href, setHref] = useState(buildDailyPath(fallbackDate));

  useEffect(() => {
    const localDate = dateToSlug(new Date());
    const nextHref = buildDailyPath(localDate);
    console.debug("[rect.run] home-play-link", {
      fallbackDate,
      localDate,
      nextHref,
    });
    setHref(nextHref);
  }, [fallbackDate]);

  return (
    <a class="shikaku-home__action shikaku-home__action--gold" href={href}>
      <span class="shikaku-home__action-kicker">/ START</span>
      <strong>Play</strong>
    </a>
  );
}
