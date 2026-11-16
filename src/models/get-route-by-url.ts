import { RoutesConfig } from "./routes-config"
import { UseActivatedRouteType } from "./use-activated-route-type"

export type GetRouteByUrl<Routes extends RoutesConfig> = (
  url: string,
  followRedirects?: boolean,
) => UseActivatedRouteType<Routes>