import type { RouteConfigChildren } from './route-config';
import type { RouteConfigInput } from './routes-config';

export type RouteConfigTypeError<TMessage extends string> = {
  readonly __routeConfigTypeError__: TMessage;
};

export type RouteConfigMapTypeErrorsDeep<TConfig> = {
  [K in keyof TConfig]: TConfig[K] extends RouteConfigTypeError<string>
    ? TConfig[K]
    : TConfig[K] extends RouteConfigInput
      ? RouteConfigMapTypeErrorsDeep<RouteConfigChildren<TConfig[K]>>
      : never;
}[keyof TConfig];

/**
 * Errors
 */

export type DuplicateRootRouteKeyError<TKey extends string> = RouteConfigTypeError<`Duplicate root route key: ${TKey}`>;

export type MissingPutInKeyError<TKey extends string> = RouteConfigTypeError<`putInKey target not found: ${TKey}`>;

export type DuplicatePutInRouteKeyError<
  TParent extends string,
  TKey extends string,
> = RouteConfigTypeError<`Duplicate child route key: ${TKey} for putInKey: ${TParent}`>;
