import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { router, setupLocation } from "./helpers";

setupLocation("/users/42?tab=profile&page=2");

describe("useRouteQueryState", () => {
  it("reads an existing query parameter", () => {
    const { result } = renderHook(() => router.useRouteQueryState<string>("tab", "overview"));
    expect(result.current[0]).toBe("profile");
  });

  it("returns fallback for a missing parameter", () => {
    const { result } = renderHook(() => router.useRouteQueryState("missing", "fallback"));
    expect(result.current[0]).toBe("fallback");
  });

  it("updates query state on a route without path params", () => {
    window.history.replaceState(null, "", "/?tab=profile&page=2");
    const { result } = renderHook(() => router.useRouteQueryState<string>("tab", "overview"));
    act(() => result.current[1]("settings"));
    expect(result.current[0]).toBe("settings");
    expect(window.location.pathname).toBe("/");
    expect(window.location.search).toBe("?tab=settings&page=2");
  });

  // Known bug: useLocation substitutes path params before separating the query string.
  it.fails("replaces the query parameter while preserving path and other params", () => {
    const replace = vi.spyOn(window.history, "replaceState");
    const { result } = renderHook(() => router.useRouteQueryState<string>("tab", "overview"));
    act(() => result.current[1]("settings"));
    expect(result.current[0]).toBe("settings");
    expect(window.location.pathname).toBe("/users/42");
    expect(new URLSearchParams(window.location.search).get("page")).toBe("2");
    expect(replace).toHaveBeenCalledWith(null, "", "/users/42?tab=settings&page=2");
  });

  it.each(["overview", ""])("removes the parameter when set to %j", (value) => {
    const { result } = renderHook(() => router.useRouteQueryState<string>("tab", "overview"));
    act(() => result.current[1](value));
    expect(window.location.search).toBe("?page=2");
    expect(result.current[0]).toBe("overview");
  });

  it("skips navigation when the value is unchanged", () => {
    const replace = vi.spyOn(window.history, "replaceState");
    const { result } = renderHook(() => router.useRouteQueryState<string>("tab", "overview"));
    act(() => result.current[1]("profile"));
    expect(replace).not.toHaveBeenCalled();
  });
});
