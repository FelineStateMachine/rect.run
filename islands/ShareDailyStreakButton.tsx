import { useEffect, useState } from "preact/hooks";

import { buildDailyPath, buildShareDailyStackText } from "@/lib/site/paths.ts";
import { getAchievedStackIndex } from "@/lib/storage/local_progress.ts";

interface ShareDailyStackButtonProps {
  date: string;
}

export default function ShareDailyStackButton(
  { date }: ShareDailyStackButtonProps,
) {
  const [stackIndex, setStackIndex] = useState(0);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(globalThis.location.origin);
    setStackIndex(getAchievedStackIndex(globalThis.localStorage, date));
  }, [date]);

  const shareUrl = origin ? `${origin}${buildDailyPath(date, stackIndex)}` : "";
  const shareText = origin
    ? buildShareDailyStackText(origin, date, stackIndex)
    : "Daily stack";

  async function handleShare() {
    if (!shareUrl) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Daily stack",
          text: shareText,
          url: shareUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // ignore user-cancelled share errors and clipboard failures
    }
  }

  return (
    <button
      class="shikaku-home__action shikaku-home__action--ghost"
      type="button"
      onClick={handleShare}
    >
      <span class="shikaku-home__action-kicker">/ SHARE</span>
      <strong>Share daily stack</strong>
    </button>
  );
}
