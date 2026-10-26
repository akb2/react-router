import { useContext } from "react";
import { render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { routerContextFabric } from "../../src";
import { router, routes, setupLocation } from "./helpers";

setupLocation();

describe("RouterContext", () => {
  it("has null as its value outside a provider", () => {
    const { result } = renderHook(() => useContext(router.RouterContext));
    expect(result.current).toBeNull();
  });

  it("shares context between factory calls", () => {
    expect(routerContextFabric(routes).RouterContext).toBe(router.RouterContext);
  });
});

describe("RouterProvider", () => {
  it("provides the original routes config", () => {
    const { result } = renderHook(() => useContext(router.RouterContext), {
      wrapper: router.RouterProvider,
    });
    expect(result.current).toBe(routes);
  });

  it("renders children", () => {
    render(
      <router.RouterProvider>
        <span>Router content</span>
      </router.RouterProvider>,
    );
    expect(screen.getByText("Router content")).toBeDefined();
  });
});
