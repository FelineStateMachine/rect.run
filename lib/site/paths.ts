import { getPlayableStackIndex } from "@/lib/storage/local_progress.ts";

export function buildDailyPath(date?: string, _stackIndex?: number): string {
  if (!date) return "/d";
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
  return `Stack ${stackIndex + 1}\n${origin}${buildDailyPath(date)}`;
}

export function resolvePlayableDailyPath(
  storage: Pick<Storage, "length" | "key" | "getItem">,
  date: string,
): string {
  getPlayableStackIndex(storage, date);
  return buildDailyPath(date);
}

export function isDailyPathname(pathname: string): boolean {
  return pathname === "/d" || pathname.startsWith("/d/") ||
    pathname === "/daily" ||
    pathname.startsWith("/daily/");
}
