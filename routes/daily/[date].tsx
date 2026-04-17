import { getPuzzleByDate } from "@/lib/shikaku/catalog.ts";
import { define } from "../../utils.ts";
import ShikakuGame from "../../islands/ShikakuGame.tsx";

export const handler = define.handlers((ctx) => {
  const puzzle = getPuzzleByDate(ctx.params.date);

  if (!puzzle) {
    return new Response("Puzzle not found", { status: 404 });
  }

  const [year, month, day] = puzzle.date.split("-").map(Number);
  const currentDate = new Date(Date.UTC(year, month - 1, day));
  const previousDate = new Date(currentDate);
  previousDate.setUTCDate(previousDate.getUTCDate() - 1);
  const nextDate = new Date(currentDate);
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);

  return {
    data: {
      puzzle,
      previousDate: previousDate.toISOString().slice(0, 10),
      nextDate: nextDate.toISOString().slice(0, 10),
    },
  };
});

export default define.page<typeof handler>(({ data }) => {
  return (
    <main class="shikaku-play-shell">
      <div class="shikaku-play-frame">
        <header class="shikaku-play-header">
          <div class="shikaku-play-header__row">
            <div class="shikaku-play-day-nav shikaku-play-day-nav--with-home">
              <a
                class="shikaku-play-nav shikaku-play-nav--home-text"
                href="/"
                aria-label="Back home"
              >
                Home
              </a>
              <a
                class="shikaku-play-nav shikaku-play-nav--icon"
                href={`/daily/${data.previousDate}`}
                aria-label="Previous day"
              >
                ‹
              </a>
              <div>
                <p class="shikaku-play-kicker">Daily puzzle</p>
                <h1 class="shikaku-play-title">{data.puzzle.date}</h1>
              </div>
              <a
                class="shikaku-play-nav shikaku-play-nav--icon"
                href={`/daily/${data.nextDate}`}
                aria-label="Next day"
              >
                ›
              </a>
            </div>
          </div>
          <p class="shikaku-play-hint">Drag. One clue.</p>
        </header>

        <ShikakuGame puzzle={data.puzzle} />
      </div>
    </main>
  );
});
