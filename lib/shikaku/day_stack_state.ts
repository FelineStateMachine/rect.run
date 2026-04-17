export interface DayStackStateInput {
  date: string;
  today: string;
  stackIndex: number;
  playableStackIndex: number;
  mostRecentStackIndex: number;
  isReplay: boolean;
}

export interface DayStackState {
  mode: "playable" | "readonly" | "locked";
  message: string;
  canReset: boolean;
}

export interface InitialStackIndexInput {
  date: string;
  today: string;
  selectedStackIndex: number;
  playableStackIndex: number;
}

export function getInitialStackIndex(input: InitialStackIndexInput): number {
  return input.date === input.today
    ? Math.max(input.selectedStackIndex, input.playableStackIndex)
    : input.selectedStackIndex;
}

export function resolveDayStackState(
  input: DayStackStateInput,
): DayStackState {
  if (input.date > input.today) {
    return {
      mode: "locked",
      message: "Locked until this day.",
      canReset: false,
    };
  }

  if (input.date < input.today) {
    if (input.isReplay) {
      return { mode: "playable", message: "Replay mode.", canReset: true };
    }

    return {
      mode: "readonly",
      message: "Past day. View only.",
      canReset: true,
    };
  }

  if (input.stackIndex > input.playableStackIndex) {
    return {
      mode: "locked",
      message: `Locked. Finish stack ${input.playableStackIndex} first.`,
      canReset: false,
    };
  }

  if (input.stackIndex < input.playableStackIndex) {
    return {
      mode: "readonly",
      message: "Earlier stack. View only.",
      canReset: false,
    };
  }

  return { mode: "playable", message: "Drag. One clue.", canReset: true };
}
