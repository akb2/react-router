import { RouteConfig } from "./route-config";
import { RouteType } from "./route-type";
import { RoutesConfig } from "./routes-config";

export interface UseActivatedRouteType<Routes extends RoutesConfig>
  extends Omit<RouteType<Routes>, 'route'> {
  activatedRoute: RouteConfig;
  pathParams: Record<string, string>;
  queryParams: Record<string, string>;
  routeUrlMask: string;
}