import { Nullable } from "@akb2/types-tools";
import { ObjectChain } from "./object-chain";
import { RoutesConfig } from "./routes-config";
import { RoutesPathKeys } from "./routes-keys";

export interface SetLocationOptions<S = unknown> {
  replace?: boolean;
  state?: S;
  transition?: boolean;
}

export type UseLocationType<Routes extends RoutesConfig, S = unknown> = [
  string,
  (
    key: ObjectChain<Routes> | RoutesPathKeys<Routes>,
    pathParams?: Nullable<Record<string | number | symbol, string | number | boolean>>,
    queryParams?: Record<string | number | symbol, Nullable<string | number | boolean>>,
    options?: SetLocationOptions<S>,
  ) => void,
];

/**
 * General hook type
 */

export type UseLocation<Routes extends RoutesConfig> = <S = unknown>() => UseLocationType<Routes, S>;
