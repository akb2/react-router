import { FC, MemoExoticComponent } from "react";
import { AnyComponent } from "./any-component";

/**
 * @deprecated Will be replaced to @akb2/react-components
 */
export type ReactComponents<Props extends object = Record<string, object>> = {
  [K in keyof Props]: Props[K] extends AnyComponent ? Props[K] : FC<Props[K]> | MemoExoticComponent<FC<Props[K]>>;
};