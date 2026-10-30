import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { router, setupLocation } from "./helpers";

setupLocation("/users/1");

describe("useLocation", () => {
  it("reads the current pathname", () => {
    const { result } = renderHook(() => router.useLocation());

    expect(result.current[0]).toBe("/users/1");
  });

  it("navigates by route key without query params", () => {
    const { result } = renderHook(() => router.useLocation());
    act(() => result.current[1]("users.detail", { id: 42 }));
    expect(result.current[0]).toBe("/users/42");
  });

  it("navigates by route key and updates its pathname", () => {
    const { result } = renderHook(() => router.useLocation());

    act(() => result.current[1]("users.detail", { id: 42 }, { page: 2 }));
    expect(result.current[0]).toBe("/users/42");
    expect(window.location.search).toBe("?page=2");
  });

  it("selects the path variant matching the supplied parameters", () => {
    const { result } = renderHook(() => router.useLocation());

    act(() => result.current[1](["article"], { slug: "hello", id: 7 }));
    expect(window.location.pathname).toBe("/articles/hello/7");
  });

  it("selects the matching path variant when query params are supplied", () => {
    const { result } = renderHook(() => router.useLocation());
    act(() => result.current[1]("article", { slug: "hello", id: 7 }, { page: 2 }));
    expect(window.location.pathname).toBe("/articles/hello/7");
    expect(window.location.search).toBe("?page=2");
  });

  it("passes replace and history state to navigation", () => {
    const replace = vi.spyOn(window.history, "replaceState");
    const { result } = renderHook(() => router.useLocation<{ source: string }>());

    act(() => result.current[1]("home", null, {}, { replace: true, state: { source: "test" } }));
    expect(replace).toHaveBeenCalledWith({ source: "test" }, "", "/");
    expect(window.history.state).toEqual({ source: "test" });
  });
});
