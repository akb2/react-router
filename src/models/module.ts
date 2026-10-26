export type Module = object;
export type ModuleKey<M extends Module> = Extract<keyof M, string>;
