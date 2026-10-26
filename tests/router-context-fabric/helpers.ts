import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import { routerContextFabric } from "../../src";

export const routes = {
  home: { path: "" },
  users: {
    path: "users",
    children: { detail: { path: ":id" } },
  },
  article: { paths: ["articles/:id", "articles/:slug/:id"] },
  archive: {
    paths: ["archive", "history"],
    children: { year: { paths: [":year", "year/:year"] } },
  },
  notFound: { isNotFound: true },
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
