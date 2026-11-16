import { RouteType } from "./route-type"
import { RoutesConfig } from "./routes-config"
import { RoutesKeys } from "./routes-keys"

export type GetRouteByKey<Routes extends RoutesConfig> = (
  key: RoutesKeys<Routes>,
  followRedirects?: boolean,
) => RouteType<Routes>