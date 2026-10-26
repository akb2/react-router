import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { router, routes, setupLocation } from "./helpers";

setupLocation();

describe("useActivatedRoute", () => {
  it("recognizes the root route", () => {
    const { result } = renderHook(() => router.useActivatedRoute());
    expect(result.current.activatedRoute).toBe(routes.home);
    expect(result.current.routeKey).toEqual(["home"]);
    expect(result.current.parents).toEqual([]);
  });

  it("returns the nested route, parents, path params and query params", () => {
    window.history.replaceState(null, "", "/users/42?tab=profile");
    const { result } = renderHook(() => router.useActivatedRoute());
    expect(result.current).toEqual({
      activatedRoute: routes.users.children.detail,
      routeKey: ["users", "detail"],
      routeKeyString: "users.detail",
      routeUrlMask: "",
      parents: [routes.users],
      pathParams: { id: "42" },
      queryParams: { tab: "profile" },
    });
  });

  // Known bug: a shorter path variant consumes segments before the longer variant is checked.
  it.fails("recognizes an alternative path spanning multiple segments", () => {
    const { result } = renderHook(() => ({
      active: router.useActivatedRoute(),
      navigate: router.useLocation()[1],
    }));
    act(() => result.current.navigate("article", { slug: "hello", id: 7 }));
    expect(window.location.pathname).toBe("/articles/hello/7");
    expect(result.current.active.activatedRoute).toBe(routes.article);
    expect(result.current.active.pathParams).toEqual({ slug: "hello", id: "7" });
  });

  it("returns notFound for an unknown URL", () => {
    window.history.replaceState(null, "", "/missing");
    const { result } = renderHook(() => router.useActivatedRoute());
    expect(result.current.activatedRoute).toBe(routes.notFound);
  });

  it("updates when only the query string changes", () => {
    const { result } = renderHook(() => ({
      active: router.useActivatedRoute(),
      navigate: router.useLocation()[1],
    }));
    act(() => result.current.navigate("home", null, { page: 2 }));
    expect(result.current.active.routeKey).toEqual(["home"]);
    expect(result.current.active.queryParams).toEqual({ page: "2" });
  });
});
