import { useEffect, useState } from "preact/hooks";

import { dateToSlug } from "@/lib/date/daily.ts";
import { resolvePlayableDailyPath } from "@/lib/site/paths.ts";

interface DailyStackRedirectProps {
  fallbackDate: string;
}

export default function DailyStackRedirect(
  { fallbackDate }: DailyStackRedirectProps,
) {
  const [href, setHref] = useState(
    resolvePlayableDailyPath(localStorageFallback(), fallbackDate),
  );

  useEffect(() => {
    const localDate = dateToSlug(new Date());
    const nextHref = resolvePlayableDailyPath(
      globalThis.localStorage,
      localDate,
    );
    setHref(nextHref);
    globalThis.location.replace(nextHref);
  }, []);

  return (
    <main class="shikaku-home shikaku-app-shell">
      <div class="shikaku-home__frame">
        <section class="shikaku-home__hero">
          <div class="shikaku-home__hero-copy">
            <div class="shikaku-home__speech-stack">
              <p class="shikaku-home__speech">Opening today.</p>
            </div>
            <div class="shikaku-home__actions">
              <a
                class="shikaku-home__action shikaku-home__action--gold"
                href={href}
              >
                <span class="shikaku-home__action-kicker">/ OPEN</span>
                <strong>Continue</strong>
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function localStorageFallback(): Pick<Storage, "length" | "key" | "getItem"> {
  return {
    length: 0,
    key: () => null,
    getItem: () => null,
  };
}
