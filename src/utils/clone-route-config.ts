import { isDefined } from "@akb2/types-tools";
import { RouteConfig } from "@models/route-config";

export const cloneRouteConfig = (config: RouteConfig): RouteConfig => {
  const children = isDefined(config.children) ? { ...config.children } : undefined;

  return isDefined(children) ? { ...config, children } : { ...config };
};