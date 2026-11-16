import { DELTA_NEGATIVE, DELTA_POSITIVE, DELTA_ZERO } from "@data/delta";

export const compareRoutePriority = (first: string, second: string): number => {
  const firstSegments = first.split("/").filter(Boolean);
  const secondSegments = second.split("/").filter(Boolean);

  for (let i = 0; i < Math.min(firstSegments.length, secondSegments.length); i++) {
    const isFirstParameterized = firstSegments[i].startsWith(":");
    const isSecondParameterized = secondSegments[i].startsWith(":");

    if (isFirstParameterized !== isSecondParameterized) {
      return isFirstParameterized ? DELTA_POSITIVE : DELTA_NEGATIVE;
    }
  }

  return DELTA_ZERO;
};
