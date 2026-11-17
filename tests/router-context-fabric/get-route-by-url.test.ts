import { describe, expect, it } from "vitest";
import { router, routes } from "./helpers";

describe("getRouteByUrl", () => {
  it("returns the root route and its metadata", () => {
    expect(router.getRouteByUrl("/")).toEqual({
      activatedRoute: routes.home,
      routeKey: ["home"],
      routeKeyString: "home",
      routeUrlMask: "",
      parents: [],
      parentsRouteKeysString: [],
      pathParams: {},
      queryParams: {},
    });
  });

  it("returns the nested route, parents, path params and query params", () => {
    expect(router.getRouteByUrl("/users/42?tab=profile&page=2")).toEqual({
      activatedRoute: routes.users.children.detail,
      routeKey: ["users", "detail"],
      routeKeyString: "users.detail",
      routeUrlMask: "",
      parents: [routes.users],
      parentsRouteKeysString: ["users"],
      pathParams: { id: "42" },
      queryParams: { tab: "profile", page: "2" },
    });
  });

  it("returns the original config object", () => {
    expect(router.getRouteByUrl("/users/42").activatedRoute).toBe(routes.users.children.detail);
  });

  it("decodes query values and preserves empty values", () => {
    expect(
      router.getRouteByUrl("/users/42?q=a%20%26%20b&tab=hello+world&empty=").queryParams,
    ).toEqual({ q: "a & b", tab: "hello world", empty: "" });
  });

  it("recognizes the short article path", () => {
    const result = router.getRouteByUrl("/articles/7");

    expect(result.activatedRoute).toBe(routes.article);
    expect(result.routeKeyString).toBe("article");
    expect(result.pathParams).toEqual({ id: "7" });
  });

  it.each(["/archive/2026", "/history/2026"])("recognizes the alternative path %s", (url) => {
    const result = router.getRouteByUrl(url);

    expect(result.activatedRoute).toBe(routes.archive.children.year);
    expect(result.routeKey).toEqual(["archive", "year"]);
    expect(result.pathParams).toEqual({ year: "2026" });
  });

  // Known bug: a shorter path variant consumes segments before the longer variant is checked.
  it.fails.each([
    ["/articles/hello/7", routes.article, "article", { slug: "hello", id: "7" }],
    ["/archive/year/2026", routes.archive.children.year, "archive.year", { year: "2026" }],
    ["/history/year/2026", routes.archive.children.year, "archive.year", { year: "2026" }],
  ] as const)(
    "recognizes the longer alternative path %s",
    (url, activatedRoute, key, pathParams) => {
      const result = router.getRouteByUrl(url);

      expect(result.activatedRoute).toBe(activatedRoute);
      expect(result.routeKeyString).toBe(key);
      expect(result.pathParams).toEqual(pathParams);
    },
  );

  it("prefers a static route over a parameterized sibling", () => {
    const result = router.getRouteByUrl("/users/new");

    expect(result.activatedRoute).toBe(routes.users.children.create);
    expect(result.routeKeyString).toBe("users.create");
    expect(result.pathParams).toEqual({});
  });

  it.each(["/missing", "/users/42/extra"])("returns notFound for %s", (url) => {
    expect(router.getRouteByUrl(url).activatedRoute).toBe(routes.notFound);
  });

  it.each([undefined, false])(
    "keeps the redirect route when followRedirects is %s",
    (followRedirects) => {
      const result = router.getRouteByUrl("/legacy", followRedirects);

      expect(result.activatedRoute).toBe(routes.legacy);
      expect(result.routeKey).toEqual(["legacy"]);
    },
  );

  it.each(["/legacy", "/older"])("follows redirects from %s to the destination metadata", (url) => {
    const result = router.getRouteByUrl(url, true);

    expect(result.activatedRoute).toBe(routes.users.children.detail);
    expect(result).toEqual(router.getRouteByUrl("/users/42?tab=profile"));
  });

  it("returns a route without a redirect when following is enabled", () => {
    expect(router.getRouteByUrl("/users/42", true)).toEqual(router.getRouteByUrl("/users/42"));
  });

  it("returns notFound when the redirect destination does not exist", () => {
    expect(router.getRouteByUrl("/broken", true).activatedRoute).toBe(routes.notFound);
  });
});
