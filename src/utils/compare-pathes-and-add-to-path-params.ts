export const comparePathesAndAddToPathParams = (
  currentPath: string,
  routePath: string,
  originalPathParams: Record<string, string>,
): boolean => {
  const pathParams = { ...originalPathParams };
  const currentPathes = currentPath.split('/');
  const routePathes = routePath.split('/');

  if (currentPathes.length !== routePathes.length) {
    return false;
  }

  for (let i = 0; i < currentPathes.length; i++) {
    if (routePathes[i].startsWith(':')) {
      pathParams[routePathes[i].slice(1)] = currentPathes[i];

      continue;
    } else if (currentPathes[i] !== routePathes[i]) {
      return false;
    }
  }

  Object.assign(originalPathParams, pathParams);

  return true;
};
