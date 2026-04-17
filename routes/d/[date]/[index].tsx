import { dateToSlug, isPastDate } from "@/lib/date/daily.ts";
import { getPuzzleByDateIndex } from "@/lib/shikaku/catalog.ts";
import { DAILY_STREAK_START_DATE } from "@/lib/shikaku/catalog.ts";
import { buildDailyPath } from "@/lib/site/paths.ts";
import { define } from "../../../utils.ts";
import ShikakuGame from "../../../islands/ShikakuGame.tsx";

export const handler = define.handlers((ctx) => {
  const date = ctx.params.date;
  const streakIndex = Number(ctx.params.index);
  const today = dateToSlug(new Date());

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isInteger(streakIndex) ||
    streakIndex < 0
  ) {
    return new Response("Puzzle not found", { status: 404 });
  }

  if (date < DAILY_STREAK_START_DATE) {
    return new Response("Puzzle not found", { status: 404 });
  }

  const puzzle = getPuzzleByDateIndex(date, streakIndex);
  if (!puzzle) {
    return new Response("Puzzle not found", { status: 404 });
  }

  const previousDate = isPastDate(DAILY_STREAK_START_DATE, date)
    ? shiftDate(date, -1)
    : null;
  const nextDate = date < today ? shiftDate(date, 1) : null;

  return {
    data: {
      puzzle,
      previousDate,
      nextDate,
      today,
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
                class="shikaku-play-nav shikaku-play-nav--icon"
                href="/"
                aria-label="Back home"
              >
                ⌂
              </a>
              {data.previousDate
                ? (
                  <a
                    class="shikaku-play-nav shikaku-play-nav--icon"
                    href={buildDailyPath(data.previousDate, 0)}
                    aria-label="Previous day"
                  >
                    ‹
                  </a>
                )
                : (
                  <span class="shikaku-play-nav shikaku-play-nav--icon is-disabled">
                    ‹
                  </span>
                )}
              <div>
                <p class="shikaku-play-kicker">
                  Daily stack · {data.puzzle.streakIndex}
                </p>
                <h1 class="shikaku-play-title">{data.puzzle.date}</h1>
              </div>
              {data.nextDate
                ? (
                  <a
                    class="shikaku-play-nav shikaku-play-nav--icon"
                    href={buildDailyPath(data.nextDate, 0)}
                    aria-label="Next day"
                  >
                    ›
                  </a>
                )
                : (
                  <span class="shikaku-play-nav shikaku-play-nav--icon is-disabled">
                    ›
                  </span>
                )}
            </div>
          </div>
          <p class="shikaku-play-hint">Drag. One clue.</p>
        </header>

        <ShikakuGame puzzle={data.puzzle} />
      </div>
    </main>
  );
});

function shiftDate(date: string, deltaDays: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(year, month - 1, day);
  value.setDate(value.getDate() + deltaDays);
  return dateToSlug(value);
}
