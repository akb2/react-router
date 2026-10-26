import { anyToArray, anyToString, CustomObject, Nullable, smartJoin } from "@akb2/types-tools";
import { VAR_SEGMENT_SYMBOL } from "@data/router";

export const createUrlFromPaths = (
  mixedPathes: string | string[],
  pathParams?: Nullable<CustomObject<string | number | boolean>>,
  safePathParams = false,
): string => {
  const joiner = '/';
  const pathes = anyToArray(mixedPathes).reduce((acc, subMixedPathes) => {
    const pathes = subMixedPathes.split(joiner);

    for (const path of pathes) {
      acc.push(path.startsWith(':') && !safePathParams ? anyToString(pathParams?.[path.slice(1)], VAR_SEGMENT_SYMBOL) : path);
    }

    return acc;
  }, [] as string[]);
  const url = joiner + smartJoin(joiner, ...pathes);

  return url.replace(/[\/\\]+/gim, joiner);
};
