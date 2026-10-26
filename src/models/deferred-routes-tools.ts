import type { DuplicatePutInRouteKeyError, RouteConfigMapTypeErrorsDeep, RouteConfigTypeError } from './merge-routes-errors';
import type { MergeRouteChildren } from './merge-routes-tools';
import type { NormalizeResolvedRoutesConfig, NormalizeRoutesConfig } from './normalize-routes-tools';
import type { NormalizePutInKey, PutInKeyFallbackParents, RouteConfigPutInKey } from './put-in-key-config';
import type { RouteConfigInput, RoutesConfig, RoutesConfigKey } from './routes-config';

type MergeDeferredRoutesForParent<
  TConfigs extends readonly RoutesConfig[],
  TRootConfig extends Record<string, RouteConfigInput>,
  TParent extends string,
  TResult extends Record<string, RouteConfigInput> = {},
> = TConfigs extends readonly [infer THead extends RoutesConfig, ...infer TTail extends readonly RoutesConfig[]]
  ? DeferredRoutesForParentInConfig<THead, TParent, PutInKeyFallbackParents<TRootConfig>> extends infer TDeferredRoutes extends Record<
      string,
      RouteConfigInput
    >
    ? Extract<Extract<keyof TResult, keyof TDeferredRoutes>, string> extends infer TDuplicateKey extends string
      ? [TDuplicateKey] extends [never]
        ? MergeDeferredRoutesForParent<TTail, TRootConfig, TParent, TResult & TDeferredRoutes>
        : DuplicatePutInRouteKeyError<TParent, TDuplicateKey>
      : never
    : never
  : TResult;

type ApplyDeferredRouteForKey<
  TRootConfig extends Record<string, RouteConfigInput>,
  TConfigs extends readonly RoutesConfig[],
  TKey extends Extract<keyof TRootConfig, string>,
> =
  MergeDeferredRoutesForParent<TConfigs, TRootConfig, TKey> extends infer TDeferredChildren
    ? TDeferredChildren extends RouteConfigTypeError<string>
      ? TDeferredChildren
      : TDeferredChildren extends Record<string, RouteConfigInput>
        ? keyof TDeferredChildren extends never
          ? TRootConfig[TKey]
          : MergeRouteChildren<TRootConfig[TKey], TDeferredChildren, TKey>
        : never
    : never;

type RouteConfigWithoutPutInKey<TConfig extends RouteConfigInput> = Omit<TConfig, 'putInKey'>;

export type DeferredRoutesForParentInConfig<
  TConfig extends RoutesConfig,
  TParent extends string,
  TKnownParents extends string = TParent,
> = {
  [K in DeferredRouteKeys<TConfig> as Extract<NormalizePutInKey<RouteConfigPutInKey<TConfig[K]>, TKnownParents>, TParent> extends never
    ? never
    : K]: RouteConfigWithoutPutInKey<TConfig[K]>;
};

export type DeferredRouteKeys<TConfig extends RoutesConfig> = {
  [K in RoutesConfigKey<TConfig>]: TConfig[K] extends { putInKey: string } ? K : never;
}[RoutesConfigKey<TConfig>];

export type DeferredRouteParents<TConfig extends RoutesConfig, TKnownParents extends string> = {
  [K in DeferredRouteKeys<TConfig>]: NormalizePutInKey<RouteConfigPutInKey<TConfig[K]>, TKnownParents>;
}[DeferredRouteKeys<TConfig>];

export type ApplyDeferredRoutes<TRootConfig extends Record<string, RouteConfigInput>, TConfigs extends readonly RoutesConfig[]> = {
  [K in Extract<keyof TRootConfig, string>]: ApplyDeferredRouteForKey<TRootConfig, TConfigs, K>;
};

export type ResolveAppliedDeferredRoutes<TAppliedRoutes extends Record<string, RouteConfigInput | RouteConfigTypeError<string>>> =
  RouteConfigMapTypeErrorsDeep<TAppliedRoutes> extends infer TError extends RouteConfigTypeError<string>
    ? [TError] extends [never]
      ? RoutesConfig<NormalizeRoutesConfig<NormalizeResolvedRoutesConfig<TAppliedRoutes>>>
      : TError
    : never;
