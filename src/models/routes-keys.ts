import type { RouteTree, RouteTreeChildren } from './routes-tree';

type RoutesPathKeysMaxDepth = [unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown];

type JoinRouteKey<TPrefix extends string, TKey extends string> = TPrefix extends '' ? TKey : `${TPrefix}.${TKey}`;

export type RouteKey<T> = Extract<keyof T, string>;

export type RoutesPathKeys<
  TRoutes extends RouteTree,
  TPrefix extends string = '',
  TDepth extends unknown[] = [],
> = TDepth extends RoutesPathKeysMaxDepth
  ? never
  : {
      [K in RouteKey<TRoutes>]:
        | JoinRouteKey<TPrefix, K>
        | (RouteTreeChildren<TRoutes[K]> extends infer TChildren extends RouteTree
            ? RoutesPathKeys<TChildren, JoinRouteKey<TPrefix, K>, [...TDepth, unknown]>
            : never);
    }[RouteKey<TRoutes>];
