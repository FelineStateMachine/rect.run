const CLUE_SYMBOLS = new Map<number, string>([
  [1, "•"],
  [2, "▬"],
  [3, "▲"],
  [4, "■"],
  [5, "⬟"],
  [6, "⬢"],
  [7, "✦"],
  [8, "⬣"],
  [9, "◉"],
]);

export function getClueSymbol(value: number): string {
  return CLUE_SYMBOLS.get(value) ?? "◆";
}
