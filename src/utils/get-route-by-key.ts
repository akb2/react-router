import { isDefined, Nullable } from "@akb2/types-tools";
import { ObjectChain } from "@models/object-chain";
import { RouteConfig } from "@models/route-config";
import { RouteType } from "@models/route-type";
import { RoutesConfig } from "@models/routes-config";
import { RoutesKeys, RoutesPathKeys } from "@models/routes-keys";
import { getRouteByUrl } from "./get-route-by-url";

export const getRouteByKey = <Routes extends RoutesConfig>(
  routes: Routes,
  mixedKeys: RoutesKeys<Routes>,
  followRedirects?: boolean,
): RouteType<Routes> => {
  const keys = Array.isArray(mixedKeys)
    ? mixedKeys
    : mixedKeys.split(".");
  const parents: RouteConfig[] = [];
  const parentsRouteKeysString: RoutesPathKeys<Routes>[] = [];
  const [notFoundRouteKey, notFoundRouteConfig] =
    Object
      .entries(routes)
      .find(([, r]) => r.isNotFound)! as [keyof Routes, RouteConfig];
  const notFoundResult = {
    route: notFoundRouteConfig,
    routeKey: [notFoundRouteKey] as ObjectChain<Routes>,
    routeKeyString: notFoundRouteKey as RoutesPathKeys<Routes>,
    parents: [],
    parentsRouteKeysString: [],
  };
  let routeKey: ObjectChain<Routes> = [] as unknown as ObjectChain<Routes>;
  let route: Nullable<RouteConfig> = null;
  let currentRoutesConfig: RoutesConfig = routes;

  for (const key of keys) {
    if (isDefined(route)) {
      parents.push(route);
      parentsRouteKeysString.push(routeKey.join(".") as RoutesPathKeys<Routes>);
    }

    if (!isDefined(currentRoutesConfig[key])) {
      return notFoundResult;
    }

    route = currentRoutesConfig[key] as RouteConfig;
    routeKey.push(key as keyof typeof currentRoutesConfig);
    currentRoutesConfig = route.children ?? {};
  }

  if (!isDefined(route)) {
    return notFoundResult;
  }

  if (followRedirects && route.redirectUrl) {
    const {
      pathParams,
      queryParams,
      routeUrlMask,
      activatedRoute,
      ...result
    } = getRouteByUrl(routes, route.redirectUrl, followRedirects);

    return { ...result, route: activatedRoute };
  }

  return {
    route,
    routeKey,
    parents,
    parentsRouteKeysString,
    routeKeyString: routeKey.join(".") as RoutesPathKeys<Routes>,
  };
};