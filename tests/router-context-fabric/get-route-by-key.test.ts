import { describe, expect, it } from "vitest";
import { router, routes } from "./helpers";

describe("getRouteByKey", () => {
  it("returns the root route without parents", () => {
    expect(router.getRouteByKey("home")).toEqual({
      route: routes.home,
      routeKey: ["home"],
      routeKeyString: "home",
      parents: [],
      parentsRouteKeysString: [],
    });
  });

  it.each(["users.detail", ["users", "detail"]] as const)(
    "accepts the typed key %j and returns its metadata",
    (key) => {
      expect(router.getRouteByKey(typeof key === "string" ? key : [...key])).toEqual({
        route: routes.users.children.detail,
        routeKey: ["users", "detail"],
        routeKeyString: "users.detail",
        parents: [routes.users],
        parentsRouteKeysString: ["users"],
      });
    },
  );

  it("returns the exact keyed config for a static sibling of a parameterized route", () => {
    const result = router.getRouteByKey("users.create");

    expect(result.route).toBe(routes.users.children.create);
    expect(result.routeKeyString).toBe("users.create");
  });

  it.each([
    ["article", routes.article],
    ["archive.year", routes.archive.children.year],
  ] as const)("finds a route with alternative paths by key %s", (key, route) => {
    const result = router.getRouteByKey(key);

    expect(result.route).toBe(route);
    expect(result.routeKeyString).toBe(key);
  });

  it("finds the pathless notFound route by key", () => {
    const result = router.getRouteByKey("notFound");

    expect(result.route).toBe(routes.notFound);
    expect(result.routeKey).toEqual(["notFound"]);
  });

  it.each([undefined, false])(
    "keeps the redirect route when followRedirects is %s",
    (followRedirects) => {
      const result = router.getRouteByKey("older", followRedirects);

      expect(result.route).toBe(routes.older);
      expect(result.routeKey).toEqual(["older"]);
    },
  );

  it.each(["legacy", ["older"]] as const)("follows redirects for key %j", (key) => {
    expect(router.getRouteByKey(typeof key === "string" ? key : [...key], true)).toEqual({
      route: routes.users.children.detail,
      routeKey: ["users", "detail"],
      routeKeyString: "users.detail",
      parents: [routes.users],
      parentsRouteKeysString: ["users"],
    });
  });

  it("returns a route without a redirect when following is enabled", () => {
    expect(router.getRouteByKey("users.detail", true).route).toBe(
      routes.users.children.detail,
    );
  });

  it("returns notFound when the redirect destination does not exist", () => {
    expect(router.getRouteByKey("broken", true)).toEqual({
      route: routes.notFound,
      routeKey: [],
      routeKeyString: "",
      parents: [],
      parentsRouteKeysString: [],
    });
  });

  it("rejects an unknown root key in TypeScript and returns notFound at runtime", () => {
    // @ts-expect-error Unknown route keys must not be accepted.
    const result = router.getRouteByKey("missing");

    expect(result.route).toBe(routes.notFound);
    expect(result.routeKey).toEqual(["notFound"]);
    expect(result.routeKeyString).toBe("notFound");
  });

  it("rejects an unknown child key in TypeScript and preserves the matched prefix at runtime", () => {
    // @ts-expect-error A nested key must belong to its parent route.
    const result = router.getRouteByKey(["users", "missing"]);

    expect(result.route).toBe(routes.notFound);
    expect(result.routeKey).toEqual(["notFound"]);
    expect(result.routeKeyString).toBe("notFound");
  });

  it("returns notFound when a key continues beyond a leaf route", () => {
    const result = router.getRouteByKey("users.create.extra");

    expect(result.route).toBe(routes.notFound);
    expect(result.routeKey).toEqual(["notFound"]);
    expect(result.routeKeyString).toBe("notFound");
  });
});
