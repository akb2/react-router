import { describe, expect, it } from "vitest";
import { router } from "./helpers";

describe("createUrlsFromRouteConfig", () => {
  it("returns one URL for a single path", () => {
    expect(router.createUrlsFromRouteConfig("users.detail", { id: 42 })).toEqual(["/users/42"]);
  });

  it("combines parent and child path variants", () => {
    expect(router.createUrlsFromRouteConfig(["archive", "year"], { year: 2026 })).toEqual([
      "/archive/2026",
      "/archive/year/2026",
      "/history/2026",
      "/history/year/2026",
    ]);
  });

  it("adds query params to every URL", () => {
    expect(
      router.createUrlsFromRouteConfig("article", { id: 7, slug: "hello" }, { page: 2 }),
    ).toEqual(["/articles/7?page=2", "/articles/hello/7?page=2"]);
  });

  it("preserves placeholders in every variant", () => {
    expect(router.createUrlsFromRouteConfig("article", null, {}, true)).toEqual([
      "/articles/:id",
      "/articles/:slug/:id",
    ]);
  });
});
