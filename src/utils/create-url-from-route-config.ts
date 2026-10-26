import { CustomObject, Nullable } from "@akb2/types-tools";
import { RoutesConfig } from "@models/routes-config";
import { RoutesKeys } from "@models/routes-keys";
import { createUrlFromPaths } from "./create-url-from-paths";
import { mixedPathToPathes } from "./mixed-path-to-pathes";
import { queryParamsToString } from "./query-params-to-string";

export const createUrlFromRouteConfig = <Routes extends RoutesConfig>(
  routes: Routes,
  mixedPath: RoutesKeys<Routes>,
  pathParams?: Nullable<CustomObject<string | number | boolean>>,
  queryParams?: CustomObject<Nullable<string | number | boolean>>,
  safePathParams = false,
): string => {
  const pathes = mixedPathToPathes(mixedPath);
  const resultPaths: string[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let currentConfig: any = routes;

  for (const path of pathes) {
    // Todo: need to create a throwable error with a message about which path is not found
    if (!Boolean(currentConfig.hasOwnProperty(path))) {
      break;
    }

    currentConfig = currentConfig[path];
    resultPaths.push(currentConfig?.path ?? currentConfig?.paths[0]);
    currentConfig = currentConfig.children;
  }

  return createUrlFromPaths(resultPaths, pathParams, safePathParams) + queryParamsToString(queryParams);
};
