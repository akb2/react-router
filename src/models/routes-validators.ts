import type { DeferredRouteParents } from './deferred-routes-tools';
import type { MissingPutInKeyError } from './merge-routes-errors';
import type { PutInKeyFallbackParents } from './put-in-key-config';
import type { RouteConfigInput, RoutesConfig } from './routes-config';

export type MissingPutInKeys<
  TConfigs extends readonly RoutesConfig[],
  TRootConfig extends Record<string, RouteConfigInput>,
> = TConfigs extends readonly [infer THead extends RoutesConfig, ...infer TTail extends readonly RoutesConfig[]]
  ?
      | Exclude<DeferredRouteParents<THead, PutInKeyFallbackParents<TRootConfig>>, Extract<keyof TRootConfig, string>>
      | MissingPutInKeys<TTail, TRootConfig>
  : never;

export type ValidatePutInKeys<TConfigs extends readonly RoutesConfig[], TRootConfig extends Record<string, RouteConfigInput>> =
  MissingPutInKeys<TConfigs, TRootConfig> extends infer TMissingKey extends string
    ? [TMissingKey] extends [never]
      ? TRootConfig
      : MissingPutInKeyError<TMissingKey>
    : never;
