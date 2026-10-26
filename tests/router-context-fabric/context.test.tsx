import { useContext } from "react";
import { act, render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { componentsContextFabric } from "../../src/fabrics/components-context-fabric";
import { router, routerContextFabric, routes, setupLocation } from "./helpers";

const { ComponentsProvider } = componentsContextFabric();
const components = { FullPageLoader: () => <span>Loading</span> };

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
  it("provides the original routes config to the active page", () => {
    render(
      <ComponentsProvider components={components}>
        <router.RouterProvider />
      </ComponentsProvider>,
    );
    expect(screen.getByText("Routes available")).toBeDefined();
  });

  it("renders the active route template", () => {
    window.history.replaceState(null, "", "/users/42");
    render(
      <ComponentsProvider components={components}>
        <router.RouterProvider />
      </ComponentsProvider>,
    );
    expect(screen.getByText("Route page")).toBeDefined();
  });

  it("updates the rendered page after navigation through useLocation", () => {
    render(
      <ComponentsProvider components={components}>
        <router.RouterProvider />
      </ComponentsProvider>,
    );
    const { result } = renderHook(() => router.useLocation());
    expect(screen.getByText("Routes available")).toBeDefined();
    act(() => result.current[1]("users.detail", { id: 42 }));
    expect(screen.queryByText("Routes available")).toBeNull();
    expect(screen.getByText("Route page")).toBeDefined();
  });
});
