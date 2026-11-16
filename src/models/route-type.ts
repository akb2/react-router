import { ObjectChain } from "./object-chain";
import { RouteConfig } from "./route-config";
import { RoutesConfig } from "./routes-config";
import { RoutesPathKeys } from "./routes-keys";

export interface RouteType<Routes extends RoutesConfig> {
  route: RouteConfig;
  routeKey: ObjectChain<Routes>;
  routeKeyString: RoutesPathKeys<Routes>;
  parents: RouteConfig[];
}