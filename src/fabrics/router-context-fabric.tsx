import {
  anyToString,
  CustomObject,
  isDefined,
  Nullable
} from "@akb2/types-tools";
import { CreateRouterContext } from "@models/create-router-context";
import { ObjectChain } from "@models/object-chain";
import { RouteConfig } from "@models/route-config";
import { RoutesConfig } from "@models/routes-config";
import { RoutesKeys, RoutesPathKeys } from "@models/routes-keys";
import { UseActivatedRouteType } from "@models/use-activated-route-type";
import { SetLocationOptions, UseLocationType } from "@models/use-location";
import { UseRoute } from "@models/use-route";
import { ROUTER_CONTEXT_KEY } from "@tokens/router";
import { createUrlFromPaths } from "@utils/create-url-from-paths";
import { createUrlFromRouteConfig as originalCreateUrlFromRouteConfig } from "@utils/create-url-from-route-config";
import { createUrlsFromRouteConfig as originalCreateUrlsFromRouteConfig } from "@utils/create-urls-from-route-config";
import { getGlobalContext } from "@utils/get-global-context";
import { getRouteByKey as originalGetRouteByKey } from "@utils/get-route-by-key";
import { getRouteByUrl as originalGetRouteByUrl } from "@utils/get-route-by-url";
import { queryParamsToString } from "@utils/query-params-to-string";
import { stringToQueryParams } from "@utils/string-to-query-params";
import { FC, Suspense, useCallback, useMemo } from "react";
import {
  Redirect,
  useSearchParams,
  useLocation as useWouterLocation,
  useRoute as useWouterRoute,
} from "wouter";
import { componentsContextFabric } from "./components-context-fabric";

export const routerContextFabric = <Routes extends RoutesConfig = RoutesConfig>(
  routes: Routes,
): CreateRouterContext<Routes> => {
  const validateRoutes = (
    currentRoutes: RoutesConfig,
    parentPaths: string[] = [""],
    pathsSet = new Set<string>(),
  ): void => {
    if (parentPaths.length === 0) {
      throw new Error("Parent paths cannot be empty.");
    }

    const isTopLevel = pathsSet.size === 0;
    let isNotFoundDefined = false;

    for (const key in currentRoutes) {
      const config = currentRoutes[key] as RouteConfig;
      const renderModes = [
        isDefined(config.Module),
        isDefined(config.Template),
        isDefined(config.redirectUrl),
      ];

      if (renderModes.filter(Boolean).length !== 1) {
        throw new Error(
          `Route with key "${key}" must have exactly one of Module, Template, or redirectUrl defined.`,
        );
      }

      const showByModes = [
        isDefined(config.path),
        isDefined(config.paths),
        config.isNotFound === true,
      ];

      if (showByModes.filter(Boolean).length !== 1) {
        throw new Error(
          `Route with key "${key}" must have exactly one of path, paths, or isNotFound defined.`,
        );
      }

      if (config.isNotFound === true) {
        if (!isTopLevel) {
          throw new Error("Not found route can only be defined at the top level.");
        } else if (isNotFoundDefined) {
          throw new Error("Only one not found route can be defined at the top level.");
        } else if (isDefined(config.children)) {
          throw new Error("Not found route cannot have children.");
        } else {
          isNotFoundDefined = true;

          continue;
        }
      }

      const paths = isDefined(config.path)
        ? [config.path]
        : isDefined(config.paths)
          ? config.paths
          : [];

      if (paths.length === 0) {
        throw new Error(`Route with key "${key}" must have at least one path defined.`);
      }

      const urls = parentPaths.flatMap((parentPath) =>
        paths.map((path) => createUrlFromPaths([parentPath, path])),
      );

      for (const url of urls) {
        if (pathsSet.has(url)) {
          throw new Error(`Duplicate route detected for URL: "${url}"`);
        }

        pathsSet.add(url);
      }

      if (isDefined(config.children)) {
        validateRoutes(config.children, urls, pathsSet);
      }
    }

    if (isTopLevel && !isNotFoundDefined) {
      throw new Error("A not found route must be defined at the top level.");
    }
  };

  validateRoutes(routes);

  /**
   * Context
   */

  const RouterContext = getGlobalContext<Routes>(ROUTER_CONTEXT_KEY);
  const RouterProvider: FC = () => {
    const {
      activatedRoute: { Module, Template, redirectUrl, SuspenseTemplate, props },
    } = useActivatedRoute();
    const { useComponents } = componentsContextFabric();
    const { FullPageLoader } = useComponents();

    const PageContent = isDefined(Module)
      ? Module
      : isDefined(Template)
        ? Template
        : (): JSX.Element => <Redirect to={redirectUrl!} />;
    const suspensed = !!SuspenseTemplate ? <SuspenseTemplate /> : <FullPageLoader />;

    return (
      <RouterContext.Provider value={routes}>
        <Suspense fallback={suspensed}>
          <PageContent {...props} />
        </Suspense>
      </RouterContext.Provider>
    );
  };

  /**
   * Utils
   */

  const getRouteByUrl = (url: string, followRedirects?: boolean) => originalGetRouteByUrl(
    routes,
    url,
    followRedirects
  );

  const getRouteByKey = (key: RoutesKeys<Routes>, followRedirects?: boolean) => originalGetRouteByKey(
    routes,
    key,
    followRedirects
  );

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
          const segments = url.split("?")[0].split("/").filter(Boolean);

          return Object.keys(pathParams ?? {}).every((key) => segments.includes(":" + key));
        }) ?? urls[0];

      const [pathnameMask, preparedQueries] = urlMask.split("?");
      const preparedUrl = createUrlFromPaths(pathnameMask, pathParams, false);
      const currentQueryParams = stringToQueryParams(preparedQueries);
      const url = preparedUrl + queryParamsToString({ ...currentQueryParams, ...queryParams });

      return setWouterLocation(url, options);
    };

    return [location, setLocation];
  };

  const useActivatedRoute = (): UseActivatedRouteType<Routes> => {
    const [location] = useLocation();
    const [searchParams] = useSearchParams();

    return useMemo((): UseActivatedRouteType<Routes> => originalGetRouteByUrl<Routes>(
      routes,
      [location, searchParams].join('?'),
      false
    ), [location, searchParams]);
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
    getRouteByUrl,
    getRouteByKey,
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
