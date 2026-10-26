import type { RoutesDefinition } from './routes-definition';
import type { RoutesPathKeys } from './routes-keys';

export type RoutesPathsConfig<TRoutes extends RoutesDefinition> = Record<RoutesPathKeys<TRoutes>, string | string[]>;
