import { cleanup } from "@testing-library/react";
import { createElement, useContext } from "react";
import { afterEach, beforeEach, vi } from "vitest";
import { routerContextFabric } from "../../src/fabrics/router-context-fabric";

export { routerContextFabric };

function Home() {
  const config = useContext(router.RouterContext);
  return createElement("span", null, config === routes ? "Routes available" : "No routes");
}

const Page = () => createElement("span", null, "Route page");

export const routes = {
  home: { path: "", Template: Home },
  users: {
    path: "users",
    Template: Page,
    children: { detail: { path: ":id", Template: Page } },
  },
  article: { paths: ["articles/:id", "articles/:slug/:id"], Template: Page },
  archive: {
    paths: ["archive", "history"],
    Template: Page,
    children: { year: { paths: [":year", "year/:year"], Template: Page } },
  },
  notFound: { isNotFound: true, Template: Page },
};

export const router = routerContextFabric(routes);

export function setupLocation(url = "/") {
  beforeEach(() => {
    window.history.replaceState(null, "", url);
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    window.history.replaceState(null, "", "/");
  });
}
