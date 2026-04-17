import { getPlayableStackIndex } from "@/lib/storage/local_progress.ts";

export function buildDailyPath(date?: string, streakIndex?: number): string {
  if (!date) return "/d";
  if (typeof streakIndex === "number") return `/d/${date}/${streakIndex}`;
  return `/d/${date}`;
}

export function buildLegacyDailyPath(date?: string): string {
  return date ? `/daily/${date}` : "/daily";
}

export function buildShareDailyStackText(
  origin: string,
  date: string,
  stackIndex: number,
): string {
  return `Daily stack · ${origin}${buildDailyPath(date, stackIndex)}`;
}

export function resolvePlayableDailyPath(
  storage: Pick<Storage, "length" | "key" | "getItem">,
  date: string,
): string {
  return buildDailyPath(date, getPlayableStackIndex(storage, date));
}

export function isDailyPathname(pathname: string): boolean {
  return pathname === "/d" || pathname.startsWith("/d/") ||
    pathname === "/daily" ||
    pathname.startsWith("/daily/");
}
