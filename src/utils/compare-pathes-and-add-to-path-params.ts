export const comparePathesAndAddToPathParams = (currentPath: string, routePath: string, pathParams: Record<string, string>): boolean => {
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

  return true;
};
