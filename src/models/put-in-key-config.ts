import type { RouteConfigInput } from './routes-config';
import type { RoutesDefinition } from './routes-definition';
import type { RoutesPathKeys } from './routes-keys';
import type { TreeChildKey } from './tree-child-key';

type ExplicitChildrenRouteKeys<TRootConfig extends Record<string, RouteConfigInput>> = {
  [K in Extract<keyof TRootConfig, string>]: TreeChildKey extends keyof TRootConfig[K] ? K : never;
}[Extract<keyof TRootConfig, string>];

/**
 * General types
 */

export type PutInKeysConfig<TRoutes extends RoutesDefinition> = {
  [K in RoutesPathKeys<TRoutes>]?: string;
};

export type NormalizePutInKey<TPutInKey, TKnownParents extends string> = TPutInKey extends string
  ? string extends TPutInKey
  ? [TKnownParents] extends [never]
  ? TPutInKey
  : TKnownParents
  : TPutInKey
  : never;

export type RouteConfigPutInKey<TConfig extends RouteConfigInput> = TConfig extends { putInKey: infer TPutInKey extends string }
  ? TPutInKey
  : never;

export type PutInKeyFallbackParents<TRootConfig extends Record<string, RouteConfigInput>> = [
  ExplicitChildrenRouteKeys<TRootConfig>,
] extends [never]
  ? Extract<keyof TRootConfig, string>
  : ExplicitChildrenRouteKeys<TRootConfig>;
