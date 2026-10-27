import { MemoExoticComponent } from "react";

/**
 * @deprecated Will be replaced to @akb2/react-components
 */
export type CanBeMemoExoticComponent<C extends JSX.Element | string | number> = MemoExoticComponent<() => C> | (() => C);