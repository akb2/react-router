import { ChildKeys } from "./child-keys";
import { TreeChildKey } from "./tree-child-key";

export type ObjectChain<T> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<any, any>
  ? {
    [K in ChildKeys<T>]:
    | [K]
    | (TreeChildKey extends keyof T[K]
      ? T[K][TreeChildKey] extends Record<PropertyKey, unknown>
      ? [K, ...ObjectChain<T[K][TreeChildKey]>]
      : [K]
      : [K]);
  }[ChildKeys<T>]
  : never;