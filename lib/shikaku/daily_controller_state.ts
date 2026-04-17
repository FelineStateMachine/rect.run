export interface DailyControllerStateInput {
  date: string;
  today: string;
  selectedStackIndex: number;
  playableStackIndex: number;
  visibleMaxStack: number;
}

export interface DailyControllerState {
  selectedStack: number;
  playableStack: number;
  visibleMaxStack: number;
}

export function buildInitialDailyControllerState(
  input: DailyControllerStateInput,
): DailyControllerState {
  if (input.date === input.today) {
    const topStack = Math.max(
      input.selectedStackIndex,
      input.playableStackIndex,
    );
    return {
      selectedStack: topStack,
      playableStack: input.playableStackIndex,
      visibleMaxStack: Math.max(input.visibleMaxStack, topStack),
    };
  }

  return {
    selectedStack: input.selectedStackIndex,
    playableStack: input.playableStackIndex,
    visibleMaxStack: input.visibleMaxStack,
  };
}
