import { Undefinable } from "@akb2/types-tools";
import { Match } from "wouter";
import { ObjectChain } from "./object-chain";
import { RoutesConfig } from "./routes-config";
import { RoutesPathKeys } from "./routes-keys";

export type UseRoute<Routes extends RoutesConfig> = (
  key: ObjectChain<Routes> | RoutesPathKeys<Routes>,
) => Match<Record<string | number, Undefinable<string>>>;