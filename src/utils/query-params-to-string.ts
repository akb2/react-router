import { anyToString, CustomObject, isDefined, Nullable } from "@akb2/types-tools";

export const queryParamsToString = (queryParams?: CustomObject<Nullable<string | number | boolean>>): string =>
  Object.entries(queryParams ?? {})
    .filter(([, value]) => isDefined(value))
    .reduce((acc, [key, value]) => acc + `${acc ? '&' : '?'}${encodeURIComponent(key)}=${encodeURIComponent(anyToString(value))}`, '');
