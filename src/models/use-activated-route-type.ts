import { ObjectChain } from "./object-chain";
import { RouteConfig } from "./route-config";
import { RoutesConfig } from "./routes-config";

export interface UseActivatedRouteType<Routes extends RoutesConfig> {
  activatedRoute: RouteConfig;
  pathParams: Record<string, string>;
  queryParams: Record<string, string>;
  routeKey: ObjectChain<Routes>;
  parents: RouteConfig[];
}