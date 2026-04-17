export function shouldReloadSavedProgress(
  previousPuzzleId: string,
  nextPuzzleId: string,
): boolean {
  return previousPuzzleId !== nextPuzzleId;
}
