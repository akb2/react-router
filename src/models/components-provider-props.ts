import { PropsWithChildren } from "react";
import { ReactComponents } from "./react-components";
import { RouterComponents } from "./router-components";

export interface ComponentsProviderProps<
  TComponents extends ReactComponents<RouterComponents> = ReactComponents<RouterComponents>,
> extends PropsWithChildren {
  components: TComponents;
}