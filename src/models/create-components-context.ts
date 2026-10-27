import { Nullable } from "@akb2/types-tools";
import { Context, FC } from "react";
import { ComponentsProviderProps } from "./components-provider-props";
import { ReactComponents } from "./react-components";
import { RouterComponents } from "./router-components";

/**
 * @deprecated Will be replaced to @akb2/react-components
 */
export interface CreateComponentsContext<
  TComponents extends ReactComponents<RouterComponents> = ReactComponents<RouterComponents>,
> {
  ComponentsContext: Context<Nullable<TComponents>>;
  ComponentsProvider: FC<ComponentsProviderProps<TComponents>>;
  useComponents: () => TComponents;
}