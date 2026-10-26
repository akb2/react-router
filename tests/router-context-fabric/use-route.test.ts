import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { router, setupLocation } from "./helpers";

setupLocation("/users/42");

describe("useRoute", () => {
  it("matches a nested route and extracts its params", () => {
    const { result } = renderHook(() => router.useRoute("users.detail"));
    expect(result.current[0]).toBe(true);
    expect(result.current[1]).toMatchObject({ id: "42" });
  });

  it("returns no match for another route", () => {
    const { result } = renderHook(() => router.useRoute(["home"]));
    expect(result.current[0]).toBe(false);
  });

  it("updates the match after navigation", () => {
    const { result } = renderHook(() => ({
      match: router.useRoute("users.detail"),
      navigate: router.useLocation()[1],
    }));
    expect(result.current.match[0]).toBe(true);
    act(() => result.current.navigate("home"));
    expect(result.current.match[0]).toBe(false);
  });
});
