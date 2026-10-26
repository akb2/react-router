import type { ObjectChain } from './object-chain';
import type { RouteConfigOnePath } from './route-config';
import type { RoutesConfig } from './routes-config';
import type { RouteKey, RoutesPathKeys } from './routes-keys';
import type { RouteTree, RouteTreeChildren } from './routes-tree';
import type { TreeChildKey } from './tree-child-key';

export type ResolvedRoutesConfig<TRoutes extends RoutesConfig = RoutesConfig> = {
  [K in keyof TRoutes]: Omit<TRoutes[K], TreeChildKey> &
  RouteConfigOnePath & {
    [P in TreeChildKey]?: TRoutes[K][TreeChildKey] extends RoutesConfig ? ResolvedRoutesConfig<TRoutes[K][TreeChildKey]> : never;
  };
};

export type ResolveRouteByPath<
  TRoutes extends RouteTree,
  TPath extends RoutesPathKeys<TRoutes> | ObjectChain<TRoutes>,
> = TPath extends readonly [infer THead, ...infer TTail]
  ? THead extends RouteKey<TRoutes>
  ? TTail['length'] extends 0
  ? TRoutes[THead]
  : RouteTreeChildren<TRoutes[THead]> extends infer TChildren extends RouteTree
  ? TTail extends ObjectChain<TChildren>
  ? ResolveRouteByPath<TChildren, TTail>
  : never
  : never
  : never
  : TPath extends `${infer THead}.${infer TTail}`
  ? THead extends RouteKey<TRoutes>
  ? RouteTreeChildren<TRoutes[THead]> extends infer TChildren extends RouteTree
  ? TTail extends RoutesPathKeys<TChildren>
  ? ResolveRouteByPath<TChildren, Extract<TTail, RoutesPathKeys<TChildren>>>
  : never
  : never
  : never
  : TPath extends RouteKey<TRoutes>
  ? TRoutes[TPath]
  : never;
