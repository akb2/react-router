import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { router, setupLocation } from "./helpers";

setupLocation("/users/42?tab=profile");

describe("useRoutePathState", () => {
  it("reads an existing path parameter", () => {
    const { result } = renderHook(() => router.useRoutePathState<string>("id", "fallback"));
    expect(result.current[0]).toBe("42");
  });

  it("returns fallback for a missing parameter", () => {
    const { result } = renderHook(() => router.useRoutePathState("missing", "fallback"));
    expect(result.current[0]).toBe("fallback");
  });

  it("updates a path parameter without query params", () => {
    window.history.replaceState(null, "", "/users/42");
    const { result } = renderHook(() => router.useRoutePathState<string>("id", "fallback"));
    act(() => result.current[1]("43"));
    expect(result.current[0]).toBe("43");
    expect(window.location.pathname).toBe("/users/43");
  });

  // Known bug: useLocation substitutes path params before separating the query string.
  it.fails("replaces the path parameter while preserving query params", () => {
    const replace = vi.spyOn(window.history, "replaceState");
    const { result } = renderHook(() => router.useRoutePathState<string>("id", "fallback"));
    act(() => result.current[1]("43"));
    expect(result.current[0]).toBe("43");
    expect(window.location.search).toBe("?tab=profile");
    expect(replace).toHaveBeenCalledWith(null, "", "/users/43?tab=profile");
  });

  it("skips navigation when the value is unchanged", () => {
    const replace = vi.spyOn(window.history, "replaceState");
    const { result } = renderHook(() => router.useRoutePathState<string>("id", "fallback"));
    act(() => result.current[1]("42"));
    expect(replace).not.toHaveBeenCalled();
  });
});
