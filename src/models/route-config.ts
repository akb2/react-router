import { TREE_CHILD_KEY } from "@data/tree-child-key";
import type { FC, LazyExoticComponent } from 'react';
import type { RouteConfigAndDefinitionBase } from './route-definition';
import type { RouteConfigInput, RoutesConfig } from './routes-config';
import { TreeChildKey } from "./tree-child-key";

/**
 * Base models
 */

interface RouteConfigBase<
  TRouteChildren extends Record<string, RouteConfig> = Record<string, RouteConfig>,
  Props extends object = {},
> extends RouteConfigAndDefinitionBase<Props> {
  [TREE_CHILD_KEY]?: RoutesConfig<TRouteChildren>;
}

/**
 * Path interfaces
 */

interface RouteConfigNotFoundPath {
  isNotFound: true;
  path?: never;
  paths?: never;
}

export interface RouteConfigOnePath {
  isNotFound?: never;
  path: string;
  paths?: never;
}

interface RouteConfigManyPath {
  isNotFound?: never;
  path?: never;
  paths: string[];
}

type RouteConfigPath = RouteConfigNotFoundPath | RouteConfigOnePath | RouteConfigManyPath;

/**
 * Render interfaces
 */

interface RouteConfigModule<Props extends object = {}> {
  Module: LazyExoticComponent<((props?: Props) => JSX.Element) | FC<Props>>;
  Template?: never;
  redirectUrl?: never;
}

interface RouteConfigTemplate<Props extends object = {}> {
  Module?: never;
  Template: (props: Props) => JSX.Element | string | number;
  redirectUrl?: never;
}

interface RouteConfigRedirect {
  Module?: never;
  Template?: never;
  redirectUrl: string;
}

export type RouteRenderConfig<Props extends object = {}> = RouteConfigModule<Props> | RouteConfigTemplate<Props> | RouteConfigRedirect;

/**
 * Extensions
 */

export interface RouteConfigExtension { }

/**
 * General model
 */

export type RouteConfig<Props extends object = {}, Keys extends string = string> = RouteConfigPath &
  RouteRenderConfig &
  RouteConfigBase<Record<Keys, RouteConfig<Props>>, Props> &
  RouteConfigExtension;

export type RouteConfigChildren<TConfig extends RouteConfigInput> = TreeChildKey extends keyof TConfig
  ? TConfig[TreeChildKey] extends RoutesConfig<infer TChildren extends Record<string, RouteConfigInput>>
  ? TChildren
  : {}
  : {};
