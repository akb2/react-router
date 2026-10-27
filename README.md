# @akb2/react-router

[Русский](README.ru.md)

Route configuration composition and React routing utilities built on Wouter.

## Installation

```sh
pnpm add @akb2/react-router react@^18.3.1 wouter@^3.13.0 @akb2/types-tools@^1.5.0
```

React, Wouter, and `@akb2/types-tools` are required peers. This repository uses pnpm 12.5.1.

## Public API

The package entry point currently exports:

| Export                    | Purpose                                                        |
| ------------------------- | -------------------------------------------------------------- |
| `reactRouterFabric`       | Merge route configurations.                                    |
| `routerContextFabric`     | Create the router provider, hooks, and URL builders.           |
| `componentsContextFabric` | Create the components provider and access hook.                |
| `ReactComponents`         | Map component props to a typed set of React components.        |
| `RouterComponents`        | Required router components: `FullPageLoader` with empty props. |
| `RouteConfig`             | One route configuration: path, rendering, and children.        |
| `RoutesConfig`            | A route configuration map that preserves its supplied type.    |
| `RouteDefinition`         | One page rendering definition without path fields.             |
| `RoutesDefinition`        | Type for rendering definitions.                                |
| `RoutesKeys`              | Route keys as arrays or dot-separated strings.                 |
| `RoutesPathKeys`          | Dot-separated route keys.                                      |

Import all three factories directly from `@akb2/react-router`.

## Compose route configurations

```tsx
import { reactRouterFabric } from "@akb2/react-router";

const baseRoutes = {
  home: { path: "", Template: () => <h1>Home</h1> },
  users: { path: "users", Template: () => <h1>Users</h1> },
  notFound: { isNotFound: true, Template: () => <h1>Not found</h1> },
};

const userRoutes = {
  detail: {
    putInKey: "users",
    path: ":id",
    Template: () => <h1>User details</h1>,
  },
};

const routes = reactRouterFabric(baseRoutes, userRoutes);
// routes.users.children.detail → /users/:id
```

The result is a configuration object, not a React router or provider. Without `putInKey`, routes are added at the root. With `putInKey`, a route is attached to `children` of the named root route. The target is a root key, not a dot-separated path. Duplicate keys and unresolved parent references throw errors; a missing parent currently uses the circular-dependency error message.

## Route configuration

| Field              | Meaning                                                |
| ------------------ | ------------------------------------------------------ |
| `path`             | One path; `""` represents the root.                    |
| `paths`            | Alternative paths for the same route.                  |
| `isNotFound`       | Marks the fallback route.                              |
| `children`         | Nested routes appended to their parent path.           |
| `Template`         | Component rendered for the active route.               |
| `Module`           | Lazy React component rendered with Suspense.           |
| `redirectUrl`      | Destination passed to Wouter's `Redirect`.             |
| `props`            | Props passed to the active page.                       |
| `SuspenseTemplate` | Per-route loading component.                           |
| `putInKey`         | Parent root key used during configuration composition. |

Dynamic path segments use `:name`, for example `users/:id`.

`routerContextFabric` validates configurations at creation time. Each route must specify exactly one of `path`, `paths`, or `isNotFound`, and exactly one of `Template`, `Module`, or `redirectUrl`. Alternative paths must be nonempty. A single fallback route is required at the root and cannot have children. Generated duplicate URLs are rejected.

## Create and render a router

Using `routes` from the composition example:

```tsx
import {
  routerContextFabric,
  componentsContextFabric,
  type ReactComponents,
  type RouterComponents,
} from "@akb2/react-router";

type AppComponents = ReactComponents<RouterComponents>;

const router = routerContextFabric(routes);
const { ComponentsProvider } = componentsContextFabric<AppComponents>();
const components: AppComponents = { FullPageLoader: () => <p>Loading…</p> };

export function App() {
  return (
    <ComponentsProvider components={components}>
      <router.RouterProvider />
    </ComponentsProvider>
  );
}
```

Create factories outside components. `ComponentsProvider` supplies `FullPageLoader`; it is required by `RouterProvider` even when the current page is synchronous. A route's `SuspenseTemplate` overrides that loader.

`RouterProvider` renders the active page and supplies the routes through `RouterContext`. It does not render arbitrary children as an application wrapper. Include navigation and layouts in route components as needed. Parent route templates are not automatically composed as nested layouts.

Wouter manages location. To customize its routing environment, place its `Router` above the consumers.

### Shared components

`componentsContextFabric()` returns `ComponentsProvider`, `ComponentsContext`, and `useComponents`. Pass a component map containing `FullPageLoader` to the provider. Call `useComponents()` inside its descendants to read that map; calling it outside the provider throws an error.

`RouterComponents` describes the required router component props. `ReactComponents<T>` maps props objects to `FC` types while preserving entries that are already component function types. Pass the resulting type as the factory's generic argument.

Extend the props map to add shared components:

```tsx
type ExtendedComponents = ReactComponents<
  RouterComponents & {
    PageTitle: { title: string };
  }
>;

const shared = componentsContextFabric<ExtendedComponents>();
const extendedComponents: ExtendedComponents = {
  FullPageLoader: () => <p>Loading…</p>,
  PageTitle: ({ title }) => <h1>{title}</h1>,
};

function SharedPageTitle() {
  const { PageTitle } = shared.useComponents();
  return <PageTitle title="Users" />;
}

function SharedComponentsExample() {
  return (
    <shared.ComponentsProvider components={extendedComponents}>
      <SharedPageTitle />
    </shared.ComponentsProvider>
  );
}
```

In an application, pass this map to the provider wrapping `RouterProvider` and read it through `shared.useComponents()` inside page components.

## Build URLs

```ts
router.createUrlFromRouteConfig("users.detail", { id: 42 });
// "/users/42"
router.createUrlFromRouteConfig(["users", "detail"], { id: 42 }, { tab: "profile" });
// "/users/42?tab=profile"
router.createUrlsFromRouteConfig("users.detail", { id: 42 });
// ["/users/42"]
```

Both builders accept `(key, pathParams?, queryParams?, safePathParams?)`. They can be called outside React.

- `createUrlFromRouteConfig` uses the first alternative path.
- `createUrlsFromRouteConfig` returns all combinations of parent and child path alternatives.
- Query keys and values are encoded; `null` values are omitted.
- Path values are substituted directly, without URL encoding. Missing values become `*`.
- Set `safePathParams` to `true` to keep placeholders such as `:id`.

## Navigation and matching hooks

Call hooks inside components or custom hooks:

```tsx
function UserNavigation() {
  const [pathname, navigate] = router.useLocation<{ source: string }>();
  const [matches, params] = router.useRoute("users.detail");
  const active = router.useActivatedRoute();

  return (
    <button
      onClick={() =>
        navigate("users.detail", { id: 42 }, undefined, {
          replace: true,
          state: { source: "navigation" },
        })
      }
    >
      {pathname}: {matches ? params?.id : active.routeKeyString}
    </button>
  );
}
```

| Hook                  | Result                                                                             |
| --------------------- | ---------------------------------------------------------------------------------- |
| `useLocation<S>()`    | `[pathname, navigate]`; pathname excludes the query string.                        |
| `useRoute(key)`       | Wouter's match tuple with extracted parameters; checks the first path alternative. |
| `useActivatedRoute()` | Active route metadata, including parent configurations.                            |

`navigate(key, pathParams?, queryParams?, options?)` forwards `replace`, `state`, and `transition` options to Wouter. It selects the first path alternative containing all supplied path parameter keys, or the first alternative if none qualifies.

`useActivatedRoute()` returns `activatedRoute`, `routeKey`, `routeKeyString`, `routeUrlMask`, `parents`, `pathParams`, and `queryParams`. Parameters read from the URL are strings. Static segments take priority over parameterized segments when choosing among matching candidates. On fallback, key and parent metadata may retain a matched prefix. Currently `routeUrlMask` contains the unmatched accumulated path and is empty after a complete match; it does not provide the matched route's full mask.

## URL state hooks

Inside a component:

```tsx
function UserIdControl() {
  const [id, setId] = router.useRoutePathState<string>("id", "unknown");

  return <button onClick={() => setId("43")}>Current user: {id}</button>;
}

function TabControl() {
  const [tab, setTab] = router.useRouteQueryState<string>("tab", "overview");

  return (
    <div>
      <span>{tab}</span>
      <button onClick={() => setTab("settings")}>Settings</button>
      <button onClick={() => setTab("overview")}>Reset tab</button>
    </div>
  );
}
```

`useRoutePathState` reads a path parameter, using the fallback when absent. Its setter affects the URL only if that parameter exists in the current route path.

`useRouteQueryState` reads a query parameter. Setting its fallback or an empty string removes that parameter; setting its current value skips navigation.

Both setters use history replacement and attempt to preserve other parameters. Both hooks accept `string | number`, but existing URL values remain strings: a numeric generic does not parse numbers.

## Types

```ts
import type { RoutesKeys, RoutesPathKeys } from "@akb2/react-router";

type Key = RoutesKeys<typeof routes>;
type PathKey = RoutesPathKeys<typeof routes>;
type Router = typeof router;
type ActiveRoute = ReturnType<typeof router.useActivatedRoute>;
```

`RouteConfig` describes one route with path and rendering fields. `RoutesConfig<T>` describes a route map and preserves the supplied type `T`. Its default input fields are permissive; use `RoutesConfig<Record<string, RouteConfig>>` to validate each route strictly.

`RouteDefinition` describes page rendering without `path`, `paths`, or `isNotFound`. `RoutesDefinition` is a map of those definitions. Add a path to a definition to use it as a route configuration.

Use `satisfies` to check the object shape while preserving concrete keys for type inference:

```tsx
import type {
  RouteConfig,
  RouteDefinition,
  RoutesConfig,
  RoutesDefinition,
} from "@akb2/react-router";

const userDefinition = {
  Template: () => <h1>User details</h1>,
} satisfies RouteDefinition;

const pageDefinitions = {
  detail: userDefinition,
} satisfies RoutesDefinition;

const typedRoutes = {
  detail: { ...pageDefinitions.detail, path: "users/:id" },
  notFound: { isNotFound: true, Template: () => <h1>Not found</h1> },
} satisfies RoutesConfig<Record<string, RouteConfig>>;
```

Avoid annotating the object with the broad `RoutesConfig` type when you need specific route keys. Derive hook and factory result types with `typeof` and `ReturnType`, as shown above.

## Known limitations

Four `it.fails` tests document two implementation defects:

- Combining dynamic path parameters with query parameters during navigation can replace the final path parameter with `*`. This also affects the state hooks.
- A shorter path alternative can match too early, causing active-route detection to return the fallback for a valid longer alternative.

Router contexts are shared globally across factory calls, while helpers capture each factory's configuration. Avoid nesting providers from unrelated configurations.

## Development

```sh
pnpm install
pnpm test
pnpm test:watch
pnpm exec tsc -p tsconfig.test.json --noEmit
pnpm build
```

Tests in `tests/router-context-fabric` cover each feature in a separate file. Expected-failure tests execute normally and must lose their `it.fails` annotation once the corresponding defect is fixed.

`pnpm build` generates ESM, CommonJS, and TypeScript declarations in `.dist` from the public entry point.

## License

[MPL-2.0](LICENSE)
