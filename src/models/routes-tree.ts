import { TreeChildKey } from "./tree-child-key";

export type RouteTreeNode = object & {
  [K in TreeChildKey]?: RouteTree;
};

export interface RouteTree {
  [key: string]: RouteTreeNode;
}

export type RouteTreeChildren<TRoute> = TRoute extends { [K in TreeChildKey]?: infer TChildren extends RouteTree } ? TChildren : never;
