# @akb2/react-router

[English](README.md)

Объединение конфигураций маршрутов и инструменты React-навигации на основе Wouter.

## Установка

```sh
pnpm add @akb2/react-router react@^18.3.1 wouter@^3.13.0 @akb2/types-tools@^1.5.0
```

React, Wouter и `@akb2/types-tools` обязательны как peer dependencies. В репозитории используется pnpm 12.5.1.

## Публичный API

Точка входа пакета сейчас экспортирует:

| Экспорт                   | Назначение                                                              |
| ------------------------- | ----------------------------------------------------------------------- |
| `reactRouterFabric`       | Объединение конфигураций маршрутов.                                     |
| `routerContextFabric`     | Создание провайдера роутера, хуков и функций построения URL.            |
| `componentsContextFabric` | Создание провайдера компонентов и хука доступа к ним.                   |
| `ReactComponents`         | Преобразование набора пропсов в типизированный набор React-компонентов. |
| `RouterComponents`        | Обязательные компоненты роутера: `FullPageLoader` с пустыми пропсами.   |
| `RouteConfig`             | Конфигурация одного маршрута: путь, отображение и дочерние маршруты.    |
| `RoutesConfig`            | Набор конфигураций маршрутов с сохранением переданного типа.            |
| `RouteDefinition`         | Определение отображения одной страницы без полей пути.                  |
| `RoutesDefinition`        | Тип определений отображения.                                            |
| `RoutesKeys`              | Ключи маршрутов в виде массивов или строк с точками.                    |
| `RoutesPathKeys`          | Ключи маршрутов в виде строк с точками.                                 |

Все три фабрики импортируются напрямую из `@akb2/react-router`.

## Объединение конфигураций

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

Результат — объект конфигурации. Без `putInKey` маршрут добавляется в корень. С `putInKey` маршрут помещается в `children` указанного корневого маршрута. Цель — корневой ключ, а не путь с точками. Повторяющиеся ключи и неразрешённые ссылки на родителей вызывают ошибки; для отсутствующего родителя сейчас используется сообщение о циклической зависимости.

## Конфигурация маршрута

| Поле               | Значение                                                      |
| ------------------ | ------------------------------------------------------------- |
| `path`             | Один путь; `""` обозначает корень.                            |
| `paths`            | Альтернативные пути одного маршрута.                          |
| `isNotFound`       | Пометка запасного маршрута.                                   |
| `children`         | Вложенные маршруты, пути которых добавляются к родительскому. |
| `Template`         | Компонент активной страницы.                                  |
| `Module`           | Ленивый React-компонент, отображаемый через Suspense.         |
| `redirectUrl`      | Адрес для `Redirect` из Wouter.                               |
| `props`            | Пропсы активной страницы.                                     |
| `SuspenseTemplate` | Компонент загрузки для конкретного маршрута.                  |
| `putInKey`         | Корневой ключ родителя для объединения конфигураций.          |

Динамические сегменты записываются как `:name`, например `users/:id`.

`routerContextFabric` проверяет конфигурацию при создании. Каждый маршрут должен содержать ровно одно из полей `path`, `paths`, `isNotFound` и ровно одно из полей `Template`, `Module`, `redirectUrl`. Массив альтернативных путей не должен быть пустым. В корне обязателен единственный запасной маршрут без дочерних элементов. Повторяющиеся сгенерированные URL запрещены.

## Создание и отображение роутера

Используя `routes` из примера объединения:

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

Создавайте фабрики вне компонентов. `ComponentsProvider` предоставляет `FullPageLoader`; он необходим для `RouterProvider`, даже когда текущая страница синхронная. Поле `SuspenseTemplate` маршрута заменяет этот загрузчик.

`RouterProvider` отображает активную страницу и предоставляет конфигурацию через `RouterContext`. Он не отображает произвольные дочерние элементы как обёртка приложения. Размещайте навигацию и макеты в компонентах маршрутов. Шаблоны родительских маршрутов автоматически не объединяются во вложенные макеты.

Адресом управляет Wouter. Для настройки окружения маршрутизации разместите его `Router` выше потребителей.

### Общие компоненты

`componentsContextFabric()` возвращает `ComponentsProvider`, `ComponentsContext` и `useComponents`. Передайте провайдеру набор компонентов с обязательным `FullPageLoader`. Хук `useComponents()` читает этот набор внутри потомков провайдера; вызов вне провайдера вызывает ошибку.

`RouterComponents` описывает пропсы обязательных компонентов роутера. `ReactComponents<T>` преобразует объекты пропсов в типы `FC`, сохраняя уже заданные типы функций компонентов. Передайте результат как generic-аргумент фабрики.

Для дополнительных общих компонентов расширьте набор пропсов:

```tsx
type ExtendedComponents = ReactComponents<
  RouterComponents & {
    PageTitle: { title: string };
  }
>;

const shared = componentsContextFabric<ExtendedComponents>();
const extendedComponents: ExtendedComponents = {
  FullPageLoader: () => <p>Загрузка…</p>,
  PageTitle: ({ title }) => <h1>{title}</h1>,
};

function SharedPageTitle() {
  const { PageTitle } = shared.useComponents();
  return <PageTitle title="Пользователи" />;
}

function SharedComponentsExample() {
  return (
    <shared.ComponentsProvider components={extendedComponents}>
      <SharedPageTitle />
    </shared.ComponentsProvider>
  );
}
```

В приложении этот набор можно передать провайдеру, который оборачивает `RouterProvider`, и читать его через `shared.useComponents()` в компонентах страниц.

## Построение URL

```ts
router.createUrlFromRouteConfig("users.detail", { id: 42 });
// "/users/42"
router.createUrlFromRouteConfig(["users", "detail"], { id: 42 }, { tab: "profile" });
// "/users/42?tab=profile"
router.createUrlsFromRouteConfig("users.detail", { id: 42 });
// ["/users/42"]
```

Обе функции принимают `(key, pathParams?, queryParams?, safePathParams?)`. Их можно вызывать вне React.

- `createUrlFromRouteConfig` использует первый альтернативный путь.
- `createUrlsFromRouteConfig` возвращает все комбинации альтернатив родителей и потомков.
- Ключи и значения query-параметров кодируются; значения `null` пропускаются.
- Значения path-параметров подставляются напрямую, без кодирования. Отсутствующие значения заменяются на `*`.
- При `safePathParams: true` сохраняются плейсхолдеры вроде `:id`.

## Хуки навигации и сопоставления

Вызывайте хуки внутри компонентов или собственных хуков:

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

| Хук                   | Результат                                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| `useLocation<S>()`    | `[pathname, navigate]`; pathname не содержит query string.                                     |
| `useRoute(key)`       | Результат сопоставления Wouter с извлечёнными параметрами; проверяет первую альтернативу пути. |
| `useActivatedRoute()` | Метаданные активного маршрута, включая конфигурации родителей.                                 |

`navigate(key, pathParams?, queryParams?, options?)` передаёт опции `replace`, `state`, `transition` в Wouter. Выбирается первая альтернатива пути со всеми переданными ключами path-параметров либо первая альтернатива, если подходящей нет.

`useActivatedRoute()` возвращает `activatedRoute`, `routeKey`, `routeKeyString`, `routeUrlMask`, `parents`, `pathParams`, `queryParams`. Параметры из URL являются строками. При выборе среди совпавших кандидатов статические сегменты приоритетнее параметризованных. При переходе к запасному маршруту метаданные ключей и родителей могут сохранять совпавшую часть дерева. Сейчас `routeUrlMask` содержит накопленный несовпавший путь и пуст после полного совпадения; полной маски найденного маршрута в нём нет.

## Хуки состояния URL

Внутри компонента:

```tsx
function UserIdControl() {
  const [id, setId] = router.useRoutePathState<string>("id", "unknown");

  return <button onClick={() => setId("43")}>Текущий пользователь: {id}</button>;
}

function TabControl() {
  const [tab, setTab] = router.useRouteQueryState<string>("tab", "overview");

  return (
    <div>
      <span>{tab}</span>
      <button onClick={() => setTab("settings")}>Настройки</button>
      <button onClick={() => setTab("overview")}>Сбросить вкладку</button>
    </div>
  );
}
```

`useRoutePathState` читает параметр пути и возвращает fallback при его отсутствии. Сеттер влияет на URL только при наличии параметра в текущем пути маршрута.

`useRouteQueryState` читает query-параметр. Установка fallback или пустой строки удаляет параметр; установка текущего значения не вызывает навигацию.

Оба сеттера заменяют текущую запись истории и пытаются сохранить остальные параметры. Оба хука принимают `string | number`, но существующие значения URL остаются строками: числовой generic не преобразует их в числа.

## Типы

```ts
import type { RoutesKeys, RoutesPathKeys } from "@akb2/react-router";

type Key = RoutesKeys<typeof routes>;
type PathKey = RoutesPathKeys<typeof routes>;
type Router = typeof router;
type ActiveRoute = ReturnType<typeof router.useActivatedRoute>;
```

`RouteConfig` описывает один маршрут с полями пути и отображения. `RoutesConfig<T>` описывает набор маршрутов и сохраняет переданный тип `T`. По умолчанию он допускает свободные входные значения; для строгой проверки каждого маршрута используйте `RoutesConfig<Record<string, RouteConfig>>`.

`RouteDefinition` описывает отображение страницы без полей `path`, `paths` и `isNotFound`. `RoutesDefinition` — набор таких определений. Определение можно дополнить путём и использовать как конфигурацию маршрута.

Используйте `satisfies`, чтобы проверить форму объекта и сохранить конкретные ключи для вывода типов:

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

Не аннотируйте объект широким типом `RoutesConfig`, если нужны конкретные ключи маршрутов. Типы хуков и результата фабрики можно получать через `typeof` и `ReturnType`, как в примере выше.

## Известные ограничения

Четыре теста с `it.fails` фиксируют две ошибки реализации:

- При навигации с динамическими path-параметрами и query-параметрами последний параметр пути может заменяться на `*`. Это также затрагивает хуки состояния.
- Короткая альтернатива пути может совпасть слишком рано, из-за чего определение активного маршрута возвращает запасной маршрут для корректной длинной альтернативы.

Контексты роутера глобально разделяются между вызовами фабрики, а функции замыкают конфигурацию своей фабрики. Избегайте вложенных провайдеров с несвязанными конфигурациями.

## Разработка

```sh
pnpm install
pnpm test
pnpm test:watch
pnpm exec tsc -p tsconfig.test.json --noEmit
pnpm build
```

В `tests/router-context-fabric` каждая возможность проверяется в отдельном файле. Тесты ожидаемых ошибок выполняются; после исправления соответствующей ошибки нужно удалить пометку `it.fails`.

`pnpm build` создаёт ESM, CommonJS и декларации TypeScript в `.dist` из публичной точки входа.

## Лицензия

[MPL-2.0](LICENSE)
