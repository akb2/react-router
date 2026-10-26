import type { RoutesConfig } from './routes-config';
import type { UnionRoutesConfig } from './union-routes-config';

export type ReactRouterFabric = {
  <const TRoutes extends readonly RoutesConfig[]>(...a: TRoutes): UnionRoutesConfig<TRoutes>;
  <const TRoutes extends readonly RoutesConfig[]>(a: TRoutes): UnionRoutesConfig<TRoutes>;
};
