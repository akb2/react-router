import { CustomObject, Nullable } from "@akb2/types-tools";
import { RoutesConfig } from "./routes-config";
import { RoutesKeys } from "./routes-keys";

export type CreateUrlFromRouteConfig<Routes extends RoutesConfig> = (
  mixedPath: RoutesKeys<Routes>,
  pathParams?: Nullable<CustomObject<string | number | boolean>>,
  queryParams?: CustomObject<Nullable<string | number | boolean>>,
  safePathParams?: boolean,
) => string;