import { useEffect, useState } from "preact/hooks";

import { dateToSlug } from "@/lib/date/daily.ts";
import { resolvePlayableDailyPath } from "@/lib/site/paths.ts";

interface DailyStackLinkProps {
  fallbackDate: string;
}

export default function DailyStackLink({ fallbackDate }: DailyStackLinkProps) {
  const [href, setHref] = useState(
    resolvePlayableDailyPath(localStorageFallback(), fallbackDate),
  );

  useEffect(() => {
    const localDate = dateToSlug(new Date());
    setHref(resolvePlayableDailyPath(globalThis.localStorage, localDate));
  }, []);

  return (
    <a class="shikaku-home__action shikaku-home__action--gold" href={href}>
      <span class="shikaku-home__action-kicker">/ START</span>
      <strong>Play</strong>
    </a>
  );
}

function localStorageFallback(): Pick<Storage, "length" | "key" | "getItem"> {
  return {
    length: 0,
    key: () => null,
    getItem: () => null,
  };
}
