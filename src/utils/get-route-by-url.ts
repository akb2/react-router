import { anyToArray, anyToString, isDefined, Nullable, SimpleObject, smartJoin } from "@akb2/types-tools";
import { ROUTER_HELPER_JOINER } from "@data/router";
import { ObjectChain } from "@models/object-chain";
import { RouteConfig } from "@models/route-config";
import { RouteConfigSearchData } from "@models/route-config-search-data";
import { RoutesConfig } from "@models/routes-config";
import { RoutesPathKeys } from "@models/routes-keys";
import { UseActivatedRouteType } from "@models/use-activated-route-type";
import { comparePathesAndAddToPathParams } from "./compare-pathes-and-add-to-path-params";
import { compareRoutePriority } from "./compare-route-priority";
import { entriesToObject } from "./entries-to-object";

export const getRouteByUrl = <Routes extends RoutesConfig>(
  routes: Routes,
  url: string,
  followRedirects = false,
): UseActivatedRouteType<Routes> => {
  const rawUrl = url.split('?');
  const rawPathes = anyToArray(anyToString(rawUrl[0]).split("/")).filter(Boolean);
  const pathes = rawPathes.length > 0 ? rawPathes : [""];
  const searchParams = new URLSearchParams(rawUrl[1] ?? "");
  const routeKey: ObjectChain<Routes> = [] as unknown as ObjectChain<Routes>;
  const parents: RouteConfig[] = [];
  const pathParams: Record<string, string> = {};
  const queryParams = entriesToObject<string>(searchParams.entries());
  let notFoundRouteConfig: Nullable<RouteConfig> = null;
  let activatedRoute: Nullable<RouteConfig> = null;
  let currentRoutesConfig: RoutesConfig = routes;
  let beforePaths = "";
  let level = 0;

  for (const path of pathes) {
    const currentPath = Boolean(beforePaths)
      ? beforePaths + "/" + path
      : path;
    const routes = new Map<string, RouteConfigSearchData>();

    for (const key in currentRoutesConfig) {
      const config = currentRoutesConfig[key] as RouteConfig;

      if (config.isNotFound === true) {
        if (level > 0) {
          throw new Error("Not found route must be defined at the root level");
        }

        notFoundRouteConfig = config as RouteConfig;

        continue;
      }

      const paths = isDefined(config.path)
        ? [config.path]
        : isDefined(config.paths)
          ? anyToArray(config.paths)
          : [];

      paths.forEach((path, index) => {
        const candidatePathParams: SimpleObject = {};

        if (comparePathesAndAddToPathParams(currentPath, path, candidatePathParams)) {
          routes.set(smartJoin(ROUTER_HELPER_JOINER, key, anyToString(index)), {
            path,
            config,
            pathParams: candidatePathParams,
          });
        }
      });
    }

    if (routes.size > 0) {
      const routesEntries = Array.from(routes.entries());
      const selectedRouteEntry = routesEntries.reduce((selected, current) =>
        compareRoutePriority(current[1].path, selected[1].path) < 0 ? current : selected,
      );
      const [selectedKey, { config: selectedRoute, pathParams: selectedPathParams }] =
        selectedRouteEntry;

      if (isDefined(activatedRoute)) {
        parents.push(activatedRoute);
      }

      beforePaths = "";
      activatedRoute = selectedRoute as RouteConfig;
      currentRoutesConfig = (activatedRoute.children ?? {}) as RoutesConfig;

      Object.assign(pathParams, selectedPathParams);
      (routeKey as unknown[]).push(selectedKey.split(ROUTER_HELPER_JOINER)[0]);

      level++;
    } else {
      beforePaths = Boolean(beforePaths)
        ? beforePaths + "/" + path
        : path;
    }
  }

  if (Boolean(beforePaths) || !isDefined(activatedRoute)) {
    activatedRoute = notFoundRouteConfig!;
  }

  if (isDefined(activatedRoute?.redirectUrl) && followRedirects) {
    return getRouteByUrl<Routes>(
      routes,
      activatedRoute.redirectUrl,
      followRedirects,
    );
  }

  return {
    activatedRoute,
    routeKey,
    parents,
    pathParams,
    queryParams,
    routeKeyString: routeKey.join(".") as RoutesPathKeys<Routes>,
    routeUrlMask: beforePaths,
  };
};
