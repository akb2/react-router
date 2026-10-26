import { Nullable } from "@akb2/types-tools";
import { Context, FC } from "react";
import { CreateUrlFromRouteConfig } from "./create-url-from-route-config";
import { CreateUrlsFromRouteConfig } from "./create-urls-from-route-config";
import { RouterProviderProps } from "./router-provider-props";
import { RoutesConfig } from "./routes-config";
import { UseActivatedRouteType } from "./use-activated-route-type";
import { UseLocation } from "./use-location";
import { UseRoute } from "./use-route";
import { UseRouteState } from "./use-route-state";

export interface CreateRouterContext<Routes extends RoutesConfig = RoutesConfig> {
  RouterContext: Context<Nullable<Routes>>;
  RouterProvider: FC<RouterProviderProps>;
  // Utils
  createUrlFromRouteConfig: CreateUrlFromRouteConfig<Routes>;
  createUrlsFromRouteConfig: CreateUrlsFromRouteConfig<Routes>;
  // Hooks
  useLocation: UseLocation<Routes>;
  useActivatedRoute: () => UseActivatedRouteType<Routes>;
  useRoute: UseRoute<Routes>;
  useRoutePathState: UseRouteState;
  useRouteQueryState: UseRouteState;
}