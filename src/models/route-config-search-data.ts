import { RouteConfig } from "./route-config";

export interface RouteConfigSearchData {
  config: RouteConfig;
  path: string;
  pathParams: Record<string, string>;
}