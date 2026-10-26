import type { ApplyDeferredRoutes, ResolveAppliedDeferredRoutes } from './deferred-routes-tools';
import type { RouteConfigTypeError } from './merge-routes-errors';
import type { MergeRootRoutesConfigs } from './merge-routes-tools';
import type { RouteConfigInput, RoutesConfig } from './routes-config';
import type { ValidatePutInKeys } from './routes-validators';

/**
 * General type
 */

export type UnionRoutesConfig<TRoutes extends readonly RoutesConfig[] = readonly RoutesConfig[]> = number extends TRoutes['length']
  ? RoutesConfig
  : MergeRootRoutesConfigs<TRoutes> extends infer TRootRoutes
    ? TRootRoutes extends RouteConfigTypeError<string>
      ? TRootRoutes
      : TRootRoutes extends Record<string, RouteConfigInput>
        ? ValidatePutInKeys<TRoutes, TRootRoutes> extends infer TValidatedRoutes
          ? TValidatedRoutes extends RouteConfigTypeError<string>
            ? TValidatedRoutes
            : TValidatedRoutes extends Record<string, RouteConfigInput>
              ? ApplyDeferredRoutes<TValidatedRoutes, TRoutes> extends infer TAppliedRoutes extends Record<
                  string,
                  RouteConfigInput | RouteConfigTypeError<string>
                >
                ? ResolveAppliedDeferredRoutes<TAppliedRoutes>
                : never
              : never
          : never
        : never
    : never;
