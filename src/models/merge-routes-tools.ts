import type { DeferredRouteKeys } from './deferred-routes-tools';
import type {
  DuplicatePutInRouteKeyError,
  DuplicateRootRouteKeyError,
  RouteConfigMapTypeErrorsDeep,
  RouteConfigTypeError,
} from './merge-routes-errors';
import type { NormalizeMergedRoutesConfig, NormalizeRoutesConfig } from './normalize-routes-tools';
import type { RouteConfigChildren } from './route-config';
import type { RouteConfigInput, RoutesConfig, RoutesConfigKey } from './routes-config';
import { TreeChildKey } from "./tree-child-key";

type RouteOwnKeys = Exclude<keyof RouteConfigInput, TreeChildKey>;

type HasOwnRouteConfig<T> = Extract<keyof T, RouteOwnKeys> extends never ? false : true;

type MergeRouteNodeSafe<TLeft extends RouteConfigInput, TRight extends RouteConfigInput> = Omit<TLeft & TRight, TreeChildKey> & {
  [K in TreeChildKey]: MergeRoutesConfigsDeep<RouteConfigChildren<TLeft>, RouteConfigChildren<TRight>>;
};

type RootRouteKeys<TConfig extends RoutesConfig> = Exclude<RoutesConfigKey<TConfig>, DeferredRouteKeys<TConfig>>;

type RootRoutesConfigPart<TConfig extends RoutesConfig> = {
  [K in RootRouteKeys<TConfig>]: TConfig[K];
};

type MergeRouteNode<TLeft extends RouteConfigInput, TRight extends RouteConfigInput, TKey extends string> =
  HasOwnRouteConfig<TLeft> extends true
  ? HasOwnRouteConfig<TRight> extends true
  ? DuplicateRootRouteKeyError<TKey>
  : MergeRouteNodeSafe<TLeft, TRight>
  : MergeRouteNodeSafe<TLeft, TRight>;

type MergeRoutesConfigsDeep<TLeft extends Record<string, RouteConfigInput>, TRight extends Record<string, RouteConfigInput>> = {
  [K in keyof TLeft | keyof TRight]: K extends keyof TLeft
  ? K extends keyof TRight
  ? K extends string
  ? MergeRouteNode<Extract<TLeft[K], RouteConfigInput>, Extract<TRight[K], RouteConfigInput>, K>
  : never
  : TLeft[K]
  : K extends keyof TRight
  ? TRight[K]
  : never;
};

export type MergeRouteChildren<
  TRouteConfig extends RouteConfigInput,
  TDeferredChildren extends Record<string, RouteConfigInput>,
  TParent extends string,
> =
  Extract<Extract<keyof RouteConfigChildren<TRouteConfig>, keyof TDeferredChildren>, string> extends infer TDuplicateKey extends string
  ? [TDuplicateKey] extends [never]
  ? Omit<TRouteConfig, TreeChildKey> & {
    [K in TreeChildKey]: RoutesConfig<NormalizeRoutesConfig<RouteConfigChildren<TRouteConfig> & TDeferredChildren>>;
  }
  : DuplicatePutInRouteKeyError<TParent, TDuplicateKey>
  : never;

export type MergeRootRoutesConfigs<
  TConfigs extends readonly RoutesConfig[],
  TResult extends Record<string, RouteConfigInput> = {},
> = TConfigs extends readonly [infer THead extends RoutesConfig, ...infer TTail extends readonly RoutesConfig[]]
  ? MergeRoutesConfigsDeep<TResult, RootRoutesConfigPart<THead>> extends infer TMerged
  ? RouteConfigMapTypeErrorsDeep<TMerged> extends infer TError extends RouteConfigTypeError<string>
  ? [TError] extends [never]
  ? MergeRootRoutesConfigs<TTail, NormalizeMergedRoutesConfig<TMerged>>
  : TError
  : never
  : never
  : TResult;
