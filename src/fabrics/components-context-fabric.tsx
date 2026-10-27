import { Nullable } from "@akb2/types-tools";
import { ComponentsProviderProps } from "@models/components-provider-props";
import { CreateComponentsContext } from "@models/create-components-context";
import { ReactComponents } from "@models/react-components";
import { RouterComponents } from "@models/router-components";
import { COMPONENTS_CONTEXT_KEY } from "@tokens/components";
import { getGlobalContext } from "@utils/get-global-context";
import type { Context, FC } from "react";
import { useContext } from "react";

/**
 * @deprecated Will be replaced to @akb2/react-components
 */
export const componentsContextFabric = <
  TComponents extends ReactComponents<RouterComponents>,
>(): CreateComponentsContext<TComponents> => {
  const ComponentsContext = getGlobalContext<TComponents>(COMPONENTS_CONTEXT_KEY);

  /**
   * @deprecated Will be replaced to @akb2/react-components
   */
  const ComponentsProvider: FC<ComponentsProviderProps<TComponents>> = ({
    components,
    children,
  }) => <ComponentsContext.Provider value={components}>{children}</ComponentsContext.Provider>;

  /**
   * @deprecated Will be replaced to @akb2/react-components
   */
  const useComponents = (): TComponents => {
    const ctx = useContext(ComponentsContext);

    if (!ctx) {
      throw new Error("useComponents must be used inside ComponentsProvider");
    }

    return ctx as TComponents;
  };

  return {
    /**
     * @deprecated Will be replaced to @akb2/react-components
     */
    ComponentsContext: ComponentsContext as unknown as Context<Nullable<TComponents>>,
    ComponentsProvider,
    useComponents,
  };
};
