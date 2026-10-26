export type UseRouteState = <T extends string | number>(key: string, fallback: T) => [T, (value: T) => void];
