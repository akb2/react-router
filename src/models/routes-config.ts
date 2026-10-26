import { TreeChildKey } from "./tree-child-key";

export interface RouteConfigInputExtension { }

export type RouteConfigInput = {
  SuspenseTemplate?: unknown;
  props?: unknown;
  putInKey?: unknown;
  isNotFound?: unknown;
  path?: unknown;
  paths?: unknown;
  Module?: unknown;
  Template?: unknown;
  redirectUrl?: unknown;
} & {
  [K in TreeChildKey]?: Record<string, RouteConfigInput>;
} & RouteConfigInputExtension;

/**
 * General types
 */

export type RoutesConfig<T extends Record<string, RouteConfigInput> = Record<string, RouteConfigInput>> = T;

export type RoutesConfigKey<TConfig extends RoutesConfig> = Extract<keyof TConfig, string>;
