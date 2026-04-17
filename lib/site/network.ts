export function getOfflineBadgeLabel(isOnline: boolean): string | null {
  return isOnline ? null : "Offline";
}
