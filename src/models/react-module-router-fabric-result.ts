import type { RoutesDefinition } from './routes-definition';
import type { RoutesPathKeys } from './routes-keys';
import type { RoutesPathsConfig } from './routes-paths-config';
import type { TreeChildKey } from './tree-child-key';

type UnionToIntersection<T> = (T extends unknown ? (x: T) => void : never) extends (x: infer R) => void ? R : never;

/**
 * General type
 */

export type ReactModuleRouterFabricResult<
  TRoutes extends RoutesDefinition,
  TPaths extends RoutesPathsConfig<TRoutes>,
  TPutInKeys extends Partial<Record<RoutesPathKeys<RoutesDefinition>, string>> | undefined,
> = UnionToIntersection<
  {
    [K in Extract<keyof TRoutes, string>]: K extends keyof TPaths
    ? K extends keyof NonNullable<TPutInKeys>
    ? {
      [P in Extract<NonNullable<TPutInKeys>[K], string>]: {
        [K2 in TreeChildKey]: {
          [R in K]: TRoutes[K] & {
            path: Extract<TPaths[K], string>;
          };
        };
      };
    }
    : {
      [R in K]: TRoutes[K] & {
        path: Extract<TPaths[K], string>;
      };
    }
    : never;
  }[Extract<keyof TRoutes, string>]
>;
