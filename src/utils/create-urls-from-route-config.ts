import { CustomObject, Nullable } from "@akb2/types-tools";
import { RoutesConfig } from "@models/routes-config";
import { RoutesKeys } from "@models/routes-keys";
import { createUrlFromPaths } from './create-url-from-paths';
import { mixedPathToPathes } from './mixed-path-to-pathes';
import { queryParamsToString } from './query-params-to-string';

export const createUrlsFromRouteConfig = <Routes extends RoutesConfig>(
  routes: Routes,
  mixedPath: RoutesKeys<Routes>,
  pathParams?: Nullable<CustomObject<string | number | boolean>>,
  queryParams?: CustomObject<Nullable<string | number | boolean>>,
  safePathParams = false,
): string[] => {
  const queryString = queryParamsToString(queryParams);
  const pathes = mixedPathToPathes(mixedPath);
  const pathVariants: string[][] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let currentConfig: any = routes;

  for (const path of pathes) {
    if (!currentConfig.hasOwnProperty(path)) {
      break;
    }

    currentConfig = currentConfig[path];

    const currentPaths: unknown[] = Array.isArray(currentConfig?.paths) ? currentConfig.paths : [currentConfig?.path];

    pathVariants.push(currentPaths.filter((currentPath): currentPath is string => typeof currentPath === 'string'));
    currentConfig = currentConfig.children;
  }

  if (pathVariants.length === 0) {
    return [createUrlFromPaths([])];
  }

  const combinations = pathVariants.reduce<string[][]>(
    (accumulator, variants) => accumulator.flatMap((segments) => variants.map((variant) => [...segments, variant])),
    [[]],
  );

  return combinations.map((segments) => createUrlFromPaths(segments, pathParams, safePathParams) + queryString);
};
