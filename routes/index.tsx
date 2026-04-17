import { listAvailablePuzzleDates } from "@/lib/shikaku/catalog.ts";
import { buildDailyPath } from "@/lib/site/paths.ts";
import { define } from "../utils.ts";
import OfflineBadge from "../islands/OfflineBadge.tsx";

export default define.page(function Home() {
  const latest = listAvailablePuzzleDates().at(-1) ??
    new Date().toISOString().slice(0, 10);

  return (
    <main class="shikaku-home shikaku-app-shell">
      <div class="shikaku-home__frame">
        <section class="shikaku-home__masthead">
          <p class="shikaku-home__brand">FelineStateMachine</p>
          <OfflineBadge />
        </section>

        <section class="shikaku-home__hero">
          <div class="shikaku-home__hero-copy">
            <div class="shikaku-home__eyebrow">SEED {latest}</div>
            <h1 class="shikaku-home__title">RECT.RUN</h1>
            <div class="shikaku-home__speech-stack" aria-label="Puzzle pitch">
              <p class="shikaku-home__speech">Daily grid.</p>
              <p class="shikaku-home__speech shikaku-home__speech--accent">
                Swipe. Solve.
              </p>
            </div>
            <div class="shikaku-home__actions">
              <a
                class="shikaku-home__action shikaku-home__action--gold"
                href={buildDailyPath(latest)}
              >
                <span class="shikaku-home__action-kicker">/ START</span>
                <strong>Play</strong>
              </a>
            </div>
          </div>

          <div class="shikaku-home__hero-art" aria-hidden="true">
            <div class="shikaku-home__sky" />
            <div class="shikaku-home__moon" />
            <div class="shikaku-home__keep">
              <span class="shikaku-home__keep-tower shikaku-home__keep-tower--left" />
              <span class="shikaku-home__keep-tower shikaku-home__keep-tower--center" />
              <span class="shikaku-home__keep-tower shikaku-home__keep-tower--right" />
              <span class="shikaku-home__keep-wall" />
              <span class="shikaku-home__keep-gate" />
              <span class="shikaku-home__banner shikaku-home__banner--left">
                ✦
              </span>
              <span class="shikaku-home__banner shikaku-home__banner--right">
                ✦
              </span>
            </div>
            <div class="shikaku-home__lawn-grid" />
          </div>
        </section>
      </div>
    </main>
  );
});
