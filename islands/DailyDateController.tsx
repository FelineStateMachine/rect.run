import { useSignal } from "@preact/signals";
import { useEffect, useMemo } from "preact/hooks";

import { dateToSlug } from "@/lib/date/daily.ts";
import { buildInitialDailyControllerState } from "@/lib/shikaku/daily_controller_state.ts";
import { resolveDayStackState } from "@/lib/shikaku/day_stack_state.ts";
import { getPuzzleByDateIndex } from "@/lib/shikaku/catalog.ts";
import {
  buildProgressKey,
  getPlayableStackIndex,
  getSelectedStackIndex,
  getVisibleStackRange,
} from "@/lib/storage/local_progress.ts";
import ShikakuGame from "./ShikakuGame.tsx";

interface DailyDateControllerProps {
  date: string;
}

export default function DailyDateController(
  { date }: DailyDateControllerProps,
) {
  const today = useSignal(date);
  const selectedStack = useSignal(0);
  const playableStack = useSignal(0);
  const visibleMaxStack = useSignal(0);
  const replayStack = useSignal<number | null>(null);
  const refreshKey = useSignal(0);

  useEffect(() => {
    if (typeof globalThis.localStorage === "undefined") return;
    const nextToday = dateToSlug(new Date());
    const nextSelected = getSelectedStackIndex(globalThis.localStorage, date);
    const nextPlayable = getPlayableStackIndex(globalThis.localStorage, date);
    const nextVisibleMax =
      getVisibleStackRange(globalThis.localStorage, date).max;
    const initialState = buildInitialDailyControllerState({
      date,
      today: nextToday,
      selectedStackIndex: nextSelected,
      playableStackIndex: nextPlayable,
      visibleMaxStack: nextVisibleMax,
    });

    console.debug("[rect.run] daily-init", {
      date,
      today: nextToday,
      selectedStackIndex: nextSelected,
      playableStackIndex: nextPlayable,
      visibleMaxStack: nextVisibleMax,
      initialState,
    });

    today.value = nextToday;
    playableStack.value = initialState.playableStack;
    visibleMaxStack.value = initialState.visibleMaxStack;
    selectedStack.value = initialState.selectedStack;
    replayStack.value = null;
    refreshKey.value += 1;
  }, [date]);

  const highestStack = useMemo(() => {
    if (date > today.value) return 0;
    if (date < today.value) {
      return Math.max(visibleMaxStack.value, selectedStack.value);
    }
    return Math.max(visibleMaxStack.value, playableStack.value);
  }, [
    date,
    today.value,
    visibleMaxStack.value,
    selectedStack.value,
    playableStack.value,
  ]);

  const puzzle = useMemo(
    () => getPuzzleByDateIndex(date, selectedStack.value),
    [date, selectedStack.value],
  );

  const dayState = useMemo(
    () =>
      resolveDayStackState({
        date,
        today: today.value,
        stackIndex: selectedStack.value,
        playableStackIndex: playableStack.value,
        mostRecentStackIndex: selectedStack.value,
        isReplay: replayStack.value === selectedStack.value,
      }),
    [
      date,
      today.value,
      selectedStack.value,
      playableStack.value,
      replayStack.value,
    ],
  );

  if (!puzzle) {
    return (
      <main class="shikaku-play-shell">
        <div class="shikaku-play-frame">
          <header class="shikaku-play-header">
            <p class="shikaku-play-hint">Puzzle not found.</p>
          </header>
        </div>
      </main>
    );
  }

  const currentPuzzle = puzzle;

  function syncFromStorage() {
    if (typeof globalThis.localStorage === "undefined") return;
    playableStack.value = getPlayableStackIndex(globalThis.localStorage, date);
    visibleMaxStack.value = Math.max(
      getVisibleStackRange(globalThis.localStorage, date).max,
      selectedStack.value,
    );
  }

  function handleReplayReset() {
    if (typeof globalThis.localStorage !== "undefined") {
      globalThis.localStorage.removeItem(buildProgressKey(currentPuzzle.id));
    }
    replayStack.value = selectedStack.value;
    refreshKey.value += 1;
    syncFromStorage();
  }

  function handleSolved() {
    replayStack.value = null;
    playableStack.value = Math.max(
      playableStack.value,
      selectedStack.value + 1,
    );
    visibleMaxStack.value = Math.max(
      visibleMaxStack.value,
      selectedStack.value + 1,
    );
  }

  const canGoDown = selectedStack.value > 0;
  const canGoUp = selectedStack.value < highestStack;

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
              {canGoDown
                ? (
                  <button
                    type="button"
                    class="shikaku-play-nav shikaku-play-nav--icon"
                    aria-label="Previous stack"
                    onClick={() => {
                      selectedStack.value -= 1;
                      replayStack.value = null;
                    }}
                  >
                    ‹
                  </button>
                )
                : (
                  <span class="shikaku-play-nav shikaku-play-nav--icon is-disabled">
                    ‹
                  </span>
                )}
              <div>
                <p class="shikaku-play-kicker">
                  Daily stack · {selectedStack.value}
                </p>
                <h1 class="shikaku-play-title">{date}</h1>
              </div>
              {canGoUp
                ? (
                  <button
                    type="button"
                    class="shikaku-play-nav shikaku-play-nav--icon"
                    aria-label="Next stack"
                    onClick={() => {
                      selectedStack.value += 1;
                      replayStack.value = null;
                    }}
                  >
                    ›
                  </button>
                )
                : (
                  <span class="shikaku-play-nav shikaku-play-nav--icon is-disabled">
                    ›
                  </span>
                )}
            </div>
          </div>
          <p class="shikaku-play-hint">{dayState.message}</p>
        </header>

        <ShikakuGame
          key={`${currentPuzzle.id}:${refreshKey.value}`}
          puzzle={currentPuzzle}
          readOnly={dayState.mode !== "playable"}
          resetEnabled={dayState.canReset}
          lockedMessage={dayState.message}
          initialMessage={dayState.message}
          solvedMessage={date === today.value &&
              selectedStack.value === playableStack.value
            ? "Solved. Stack above unlocked."
            : "Solved!"}
          onReset={dayState.mode !== "playable" ? handleReplayReset : undefined}
          onSolved={handleSolved}
        />
      </div>
    </main>
  );
}
