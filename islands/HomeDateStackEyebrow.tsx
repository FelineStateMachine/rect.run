import { useEffect, useState } from "preact/hooks";

import { dateToSlug } from "@/lib/date/daily.ts";
import { getInitialStackIndex } from "@/lib/shikaku/day_stack_state.ts";
import {
  getPlayableStackIndex,
  getSelectedStackIndex,
} from "@/lib/storage/local_progress.ts";

interface HomeDateStackEyebrowProps {
  fallbackDate: string;
}

export default function HomeDateStackEyebrow(
  { fallbackDate }: HomeDateStackEyebrowProps,
) {
  const [label, setLabel] = useState(buildLabel(fallbackDate, 0));

  useEffect(() => {
    const localDate = dateToSlug(new Date());
    const selectedStackIndex = getSelectedStackIndex(
      globalThis.localStorage,
      localDate,
    );
    const playableStackIndex = getPlayableStackIndex(
      globalThis.localStorage,
      localDate,
    );
    const stackIndex = getInitialStackIndex({
      date: localDate,
      today: localDate,
      selectedStackIndex,
      playableStackIndex,
    });

    setLabel(buildLabel(localDate, stackIndex));
  }, []);

  return <div class="shikaku-home__eyebrow">{label}</div>;
}

function buildLabel(date: string, stackIndex: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(year, month - 1, day);
  const formatted = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);

  return `${formatted} - Stack ${stackIndex + 1}`;
}
