export const SITE_NAME = "rect.run";
export const SITE_SHORT_NAME = "rect.run";
export const SITE_DESCRIPTION =
  "Daily mobile-first Shikaku puzzles with touch-native rectangle play.";
export const SITE_THEME_COLOR = "#122411";
export const SITE_BACKGROUND_COLOR = "#0f180d";

export function buildPageTitle(label?: string): string {
  return label ? `${label} · ${SITE_NAME}` : SITE_NAME;
}
