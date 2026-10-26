import { Undefinable } from "@akb2/types-tools";
import type { PutInKeysConfig } from './put-in-key-config';
import type { ReactModuleRouterFabricResult } from './react-module-router-fabric-result';
import type { RoutesDefinition } from './routes-definition';
import type { RoutesPathsConfig } from './routes-paths-config';

/**
 * General module
 */

export type ReactModuleRouterFabric = <
  const TRoutes extends RoutesDefinition,
  const TPaths extends RoutesPathsConfig<TRoutes>,
  const TPutInKeys extends Undefinable<PutInKeysConfig<RoutesDefinition>> = undefined,
>(
  routes: TRoutes,
  pathes: TPaths,
  putInKeysConfig?: TPutInKeys,
) => ReactModuleRouterFabricResult<TRoutes, TPaths, TPutInKeys>;
