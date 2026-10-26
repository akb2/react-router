import type { RouteDefinition } from './route-definition';

export type RoutesDefinition<T extends Record<string, RouteDefinition<object, string>> = Record<string, RouteDefinition<{}, string>>> = T;
