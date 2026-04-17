import { useEffect, useState } from "preact/hooks";

import { getOfflineBadgeLabel } from "@/lib/site/network.ts";

export default function OfflineBadge() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const sync = () => setIsOnline(navigator.onLine);
    sync();
    addEventListener("online", sync);
    addEventListener("offline", sync);
    return () => {
      removeEventListener("online", sync);
      removeEventListener("offline", sync);
    };
  }, []);

  const label = getOfflineBadgeLabel(isOnline);
  if (!label) return null;

  return <span class="shikaku-home__offline-badge">{label}</span>;
}
