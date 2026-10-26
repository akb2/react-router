import { TREE_CHILD_KEY } from "@data/tree-child-key";
import { CanBeMemoExoticComponent } from "./can-be-memo-exotic-component";
import { RouteRenderConfig } from "./route-config";
import { RoutesDefinition } from "./routes-definition";

/**
 * Config interface
 */

export interface RouteConfigAndDefinitionBase<Props extends object = {}> {
  SuspenseTemplate?: CanBeMemoExoticComponent<JSX.Element | string | number>;
  props?: Props;
  putInKey?: string;
}

/**
 * Children interface
 */

interface RouteDefinitionBase<
  TRouteChildren extends Record<string, RouteDefinition> = Record<string, RouteDefinition>,
  Props extends object = {},
> extends RouteConfigAndDefinitionBase<Props> {
  [TREE_CHILD_KEY]?: RoutesDefinition<TRouteChildren>;
}

/**
 * For extension
 */

export interface RouteDefinitionExtension { }

/**
 * Base type
 */

export type RouteDefinition<Props extends object = {}, Keys extends string = string> = RouteRenderConfig<Props> &
  RouteDefinitionBase<Record<Keys, RouteDefinition>, Props> &
  RouteDefinitionExtension;
