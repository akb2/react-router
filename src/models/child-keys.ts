import { RemoveIndexSignature } from "./remove-index-signature";

export type ChildKeys<T> = [keyof RemoveIndexSignature<T>] extends [never]
  ? Extract<keyof T, string | number | symbol>
  : Extract<keyof RemoveIndexSignature<T>, string | number | symbol>;