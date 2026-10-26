import { anyToArray, anyToString, CustomObject, isDefined, Nullable } from "@akb2/types-tools";
import { CreateRouterContext } from "@models/create-router-context";
import { ObjectChain } from "@models/object-chain";
import { RouteConfig } from "@models/route-config";
import { RouterProviderProps } from "@models/router-provider-props";
import { RoutesConfig } from "@models/routes-config";
import { RoutesKeys, RoutesPathKeys } from "@models/routes-keys";
import { UseActivatedRouteType } from "@models/use-activated-route-type";
import { SetLocationOptions, UseLocationType } from "@models/use-location";
import { UseRoute } from "@models/use-route";
import { ROUTER_CONTEXT_KEY } from "@tokens/router";
import { type FC, useCallback, useMemo } from "react";
import {
  useSearchParams,
  useLocation as useWouterLocation,
  useRoute as useWouterRoute,
} from "wouter";
import { comparePathesAndAddToPathParams } from "./compare-pathes-and-add-to-path-params";
import { createUrlFromPaths } from "./create-url-from-paths";
import { createUrlFromRouteConfig as originalCreateUrlFromRouteConfig } from "./create-url-from-route-config";
import { createUrlsFromRouteConfig as originalCreateUrlsFromRouteConfig } from "./create-urls-from-route-config";
import { entriesToObject } from "./entries-to-object";
import { getGlobalContext } from "./get-global-context";
import { queryParamsToString } from "./query-params-to-string";
import { stringToQueryParams } from "./string-to-query-params";

export const routerContextFabric = <Routes extends RoutesConfig = RoutesConfig>(
  routes: Routes,
): CreateRouterContext<Routes> => {
  const RouterContext = getGlobalContext<Routes>(ROUTER_CONTEXT_KEY);
  const RouterProvider: FC<RouterProviderProps> = ({ children }) => (
    <RouterContext.Provider value={routes}> {children} </RouterContext.Provider>
  );

  /**
   * Utils
   */

  const createUrlFromRouteConfig = originalCreateUrlFromRouteConfig.bind(null, routes);
  const createUrlsFromRouteConfig = originalCreateUrlsFromRouteConfig.bind(null, routes);

  /**
   * Hooks
   */

  const useRoute: UseRoute<Routes> = (key: RoutesKeys<Routes>) =>
    useWouterRoute(createUrlFromRouteConfig(key, null, {}, true));

  const useLocation = <S extends unknown = unknown>(): UseLocationType<Routes, S> => {
    const [location, setWouterLocation] = useWouterLocation();

    const setLocation = (
      key: ObjectChain<Routes> | RoutesPathKeys<Routes>,
      pathParams?: Nullable<CustomObject<string | number | boolean>>,
      queryParams?: CustomObject<Nullable<string | number | boolean>>,
      options?: SetLocationOptions<S>,
    ): void => {
      const urls = createUrlsFromRouteConfig(key, pathParams, queryParams, true);
      const urlMask =
        urls.find((url) => {
          const segments = url.split("/").filter(Boolean);

          return Object.keys(pathParams ?? {}).every((key) => segments.includes(":" + key));
        }) ?? urls[0];

      const [preparedUrl, preparedQueries] = createUrlFromPaths(urlMask, pathParams, false).split(
        "?",
      );
      const currentQueryParams = stringToQueryParams(preparedQueries);
      const url = preparedUrl + queryParamsToString({ ...currentQueryParams, ...queryParams });

      return setWouterLocation(url, options);
    };

    return [location, setLocation];
  };

  const useActivatedRoute = (): UseActivatedRouteType<Routes> => {
    const [location] = useLocation();
    const [searchParams] = useSearchParams();

    const pathes = useMemo(() => {
      const pathes = location.split("/").filter(Boolean);

      return pathes.length > 0 ? pathes : [""];
    }, [location]);

    return useMemo((): UseActivatedRouteType<Routes> => {
      const routeKey: ObjectChain<Routes> = [] as unknown as ObjectChain<Routes>;
      const parents: RouteConfig[] = [];
      const pathParams: Record<string, string> = {};
      const queryParams = entriesToObject<string>(searchParams.entries());
      let activatedRoute: Nullable<RouteConfig> = null;
      let currentRoutesConfig: RoutesConfig = routes;
      let beforePaths = "";

      for (const path of pathes) {
        const currentPath = Boolean(beforePaths) ? beforePaths + "/" + path : path;

        const routes = Object.entries(currentRoutesConfig).filter(([, config]) => {
          if (isDefined(config.path)) {
            return comparePathesAndAddToPathParams(
              currentPath,
              anyToString(config.path),
              pathParams,
            );
          } else if (isDefined(config.paths)) {
            return anyToArray(config.paths).some((p) =>
              comparePathesAndAddToPathParams(currentPath, anyToString(p), pathParams),
            );
          }

          return false;
        });

        if (routes.length > 1) {
          throw new Error("Error in routes config: you have routes with similar pathes");
        } else if (routes.length === 0) {
          beforePaths = Boolean(beforePaths) ? beforePaths + "/" + path : path;
        } else {
          if (isDefined(activatedRoute)) {
            parents.push(activatedRoute);
          }

          beforePaths = "";
          activatedRoute = routes[0][1] as RouteConfig;
          currentRoutesConfig = (activatedRoute.children ?? {}) as RoutesConfig;
          (routeKey as unknown[]).push(routes[0][0]);
        }
      }

      if (Boolean(beforePaths) || !isDefined(activatedRoute)) {
        activatedRoute = routes.notFound as unknown as RouteConfig;
      }

      return {
        activatedRoute,
        routeKey,
        parents,
        pathParams,
        queryParams,
      };
    }, [pathes, searchParams]);
  };

  const useRoutePathState = <T extends string | number>(
    key: string,
    fallback: T,
  ): [T, (value: T) => void] => {
    const [, setLocation] = useLocation();
    const { routeKey, pathParams, queryParams } = useActivatedRoute();
    const value = pathParams[key];
    const setPathParam = useCallback(
      (newValue: T): void => {
        if (value !== newValue) {
          setLocation(routeKey, { ...pathParams, [key]: newValue }, queryParams, { replace: true });
        }
      },
      [value, routeKey, pathParams, queryParams],
    );

    return [(value ?? fallback) as T, setPathParam];
  };

  const useRouteQueryState = <T extends string | number>(
    key: string,
    fallback: T,
  ): [T, (value: T) => void] => {
    const [, setLocation] = useLocation();
    const { routeKey, pathParams, queryParams } = useActivatedRoute();
    const value = queryParams[key] ?? fallback;

    const setQueryParam = useCallback(
      (newValue: T): void => {
        if (value !== newValue) {
          const newQueryParams = { ...queryParams };

          if (isDefined(newValue) && newValue !== fallback && anyToString(newValue).length > 0) {
            newQueryParams[key] = anyToString(newValue);
          } else {
            delete newQueryParams[key];
          }

          setLocation(routeKey, pathParams, newQueryParams, { replace: true });
        }
      },
      [value, routeKey, pathParams, queryParams, fallback],
    );

    return [(value ?? fallback) as T, setQueryParam];
  };

  return {
    RouterContext,
    RouterProvider,
    // Utils
    createUrlFromRouteConfig,
    createUrlsFromRouteConfig,
    // Hooks
    useLocation,
    useActivatedRoute,
    useRoute,
    useRoutePathState,
    useRouteQueryState,
  };
};
