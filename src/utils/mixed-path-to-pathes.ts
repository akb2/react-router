import { ObjectChain } from "@models/object-chain";
import { RoutesConfig } from "@models/routes-config";
import { RoutesKeys } from "@models/routes-keys";

export const mixedPathToPathes = <Routes extends RoutesConfig>(mixedPath: RoutesKeys<Routes>): ObjectChain<Routes> =>
  Array.isArray(mixedPath) ? (mixedPath as ObjectChain<Routes>) : (mixedPath.split('.') as ObjectChain<Routes>);
