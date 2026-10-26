export const entriesToObject = <T extends unknown>(entries: Iterable<readonly [string, T]>): Record<string, T> =>
  Array.from(entries).reduce(
    (acc, [key, value]) => {
      acc[key] = value;
      return acc;
    },
    {} as Record<string, T>,
  );