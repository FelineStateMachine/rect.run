export type PlayStatus = "in_progress" | "solved";

export function canRemovePlacedRectangle(status: PlayStatus): boolean {
  return status === "in_progress";
}

export function getStatusTone(status: PlayStatus): "default" | "solved" {
  return status === "solved" ? "solved" : "default";
}
