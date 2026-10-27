import { PropsWithChildren } from "react";
import { ReactComponents } from "./react-components";
import { RouterComponents } from "./router-components";

/**
 * @deprecated Will be replaced to @akb2/react-components
 */
export interface ComponentsProviderProps<
  TComponents extends ReactComponents<RouterComponents> = ReactComponents<RouterComponents>,
> extends PropsWithChildren {
  components: TComponents;
}