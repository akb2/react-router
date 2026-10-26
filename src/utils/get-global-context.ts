import { Nullable } from "@akb2/types-tools";
import { Context, createContext } from "react";

export const getGlobalContext = <T extends unknown>(
  key: symbol,
  initialValue: Nullable<T> = null,
): Context<Nullable<T>> => {
  const globalContexts = globalThis as Record<symbol, Context<Nullable<T>>>;

  if (!(key in globalContexts)) {
    globalContexts[key] = createContext<Nullable<T>>(initialValue);
  }

  return globalContexts[key] as Context<Nullable<T>>;
};
