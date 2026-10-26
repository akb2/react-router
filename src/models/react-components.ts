import { FC } from "react";
import { AnyComponent } from "./any-component";

export type ReactComponents<Props extends object = Record<string, object>> = {
  [K in keyof Props]: Props[K] extends AnyComponent ? Props[K] : FC<Props[K]>;
};