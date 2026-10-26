import { isDefined } from "@akb2/types-tools";
import { RouteConfig } from "@models/route-config";
import { RoutesConfig } from "@models/routes-config";
import { UnionRoutesConfig } from "@models/union-routes-config";
import { cloneRouteConfig } from "../utils/clone-route-config";

export function reactRouterFabric<const TRoutes extends readonly RoutesConfig[]>(
  ...mixedRoutesConfigs: TRoutes
): UnionRoutesConfig<TRoutes>;
export function reactRouterFabric<const TRoutes extends readonly RoutesConfig[]>(
  mixedRoutesConfigs: TRoutes[],
): UnionRoutesConfig<TRoutes>;
export function reactRouterFabric<const TRoutes extends readonly RoutesConfig[]>(
  ...mixedRoutesConfigs: TRoutes | TRoutes[]
): UnionRoutesConfig<TRoutes> {
  const routesConfigs = Array.isArray(mixedRoutesConfigs[0])
    ? mixedRoutesConfigs[0]
    : mixedRoutesConfigs;
  const resultConfig: RoutesConfig = {};
  const delayedConfig: [string, RouteConfig][] = [];
  // To prevent infinite loops in case of circular dependencies
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  let limit = 100;

  for (const routesConfig of routesConfigs) {
    for (const routeKey in routesConfig) {
      const config = routesConfig[routeKey];

      if (!isDefined(config.putInKey) && isDefined(resultConfig[routeKey])) {
        throw new Error(`Duplicate route key "${routeKey}" found in module options.`);
      }

      if (!isDefined(config.putInKey)) {
        resultConfig[routeKey] = config;
      } else {
        delayedConfig.push([routeKey, config]);
      }
    }
  }

  while (delayedConfig.length > 0 && limit-- > 0) {
    const delayedItemIndex = delayedConfig.findIndex(
      ([, { putInKey }]) => isDefined(putInKey) && isDefined(resultConfig[putInKey]),
    );

    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    if (delayedItemIndex === -1) {
      throw new Error(
        'Circular dependency detected in route configurations. Please check the "putInKey" properties.',
      );
    }

    const [routeKey, rawConfig] = delayedConfig[delayedItemIndex];
    const { putInKey, ...config } = rawConfig;

    if (!isDefined(putInKey)) {
      throw new Error('Invalid route configuration. "putInKey" is not defined.');
    }

    const parentConfig = resultConfig[putInKey];
    const children = isDefined(parentConfig.children) ? { ...parentConfig.children } : {};

    if (isDefined(children[routeKey])) {
      throw new Error(`Duplicate route key "${routeKey}" found in module options.`);
    }

    children[routeKey] = cloneRouteConfig(config);
    resultConfig[putInKey] = { ...parentConfig, children };
    delayedConfig.splice(delayedItemIndex, 1);
  }

  return resultConfig as UnionRoutesConfig<TRoutes>;
}
