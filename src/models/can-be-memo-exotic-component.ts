import { MemoExoticComponent } from "react";

export type CanBeMemoExoticComponent<C extends JSX.Element | string | number> = MemoExoticComponent<() => C> | (() => C);