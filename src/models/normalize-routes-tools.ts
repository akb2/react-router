import type { RouteConfigTypeError } from './merge-routes-errors';
import type { RouteConfigInput } from './routes-config';

export type NormalizeMergedRoutesConfig<TConfig> = {
  [K in Extract<keyof TConfig, string>]: Extract<TConfig[K], RouteConfigInput>;
};

export type NormalizeResolvedRoutesConfig<TConfig extends Record<string, RouteConfigInput | RouteConfigTypeError<string>>> = {
  [K in keyof TConfig as TConfig[K] extends RouteConfigTypeError<string> ? never : K]: Extract<TConfig[K], RouteConfigInput>;
};

export type NormalizeRoutesConfig<TConfig extends Record<string, RouteConfigInput>> = {
  [K in keyof TConfig]: TConfig[K];
};
