import { describe, expect, it } from "vitest";
import { router } from "./helpers";

describe("createUrlFromRouteConfig", () => {
  it("builds the root URL", () => expect(router.createUrlFromRouteConfig("home")).toBe("/"));

  it.each(["users.detail", ["users", "detail"]] as const)("accepts route key %j", (key) => {
    expect(
      router.createUrlFromRouteConfig(typeof key === "string" ? key : [...key], { id: 42 }),
    ).toBe("/users/42");
  });

  it("encodes query values and omits null values", () => {
    expect(
      router.createUrlFromRouteConfig("home", null, {
        q: "a & b",
        page: 2,
        active: false,
        empty: null,
      }),
    ).toBe("/?q=a%20%26%20b&page=2&active=false");
  });

  it("uses the first path of a route with multiple paths", () => {
    expect(router.createUrlFromRouteConfig("article", { id: 7 })).toBe("/articles/7");
  });

  it("preserves placeholders when safePathParams is enabled", () => {
    expect(router.createUrlFromRouteConfig("users.detail", { id: 42 }, {}, true)).toBe(
      "/users/:id",
    );
  });
});
