export function buildDailyPath(date?: string): string {
  return date ? `/d/${date}` : "/d";
}

export function buildLegacyDailyPath(date?: string): string {
  return date ? `/daily/${date}` : "/daily";
}

export function isDailyPathname(pathname: string): boolean {
  return pathname === "/d" || pathname.startsWith("/d/") ||
    pathname === "/daily" ||
    pathname.startsWith("/daily/");
}
