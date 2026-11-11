import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * /calendar under both states of the single hold flag (src/lib/permit-hold.ts). The flag is a module
 * constant, so each state loads the real page with the constant replaced. Nothing here deletes or
 * stubs the calendar: the same page renders it when the flag is false.
 */
afterEach(() => {
  vi.doUnmock("@/lib/permit-hold");
  vi.resetModules();
});

async function renderCalendar(held: boolean) {
  vi.resetModules();
  vi.doMock("@/lib/permit-hold", async (orig) => ({ ...(await orig<typeof import("@/lib/permit-hold")>()), OFFICIAL_RUNS_ON_HOLD: held }));
  // The weather panel fetches on the server; this test never needs it.
  vi.doMock("@/components/weather/WeatherPanel", () => ({ WeatherPanel: () => null }));
  vi.doMock("@/components/weather/WeatherGuidance", () => ({ WeatherGuidance: () => null }));
  const { default: CalendarPage } = await import("@/app/calendar/page");
  const ui = await CalendarPage({ searchParams: Promise.resolve({}) });
  return render(ui);
}

describe("/calendar flag states", () => {
  it("held: the page hero and the Hills on pause section only; no calendar anywhere in the DOM", async () => {
    const { container } = await renderCalendar(true);
    expect(screen.getByRole("heading", { level: 1, name: "Hills on repeat." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Hills on pause." })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "See you on the hill." })).toBeNull();
    expect(screen.queryByRole("heading", { name: /New here/ })).toBeNull();
    expect(screen.getByRole("button", { name: "send us your questions" })).toBeInTheDocument();
    // Removed, not hidden: no calendar controls, grid, times, run names or run links to be reached.
    expect(container.querySelector("[role=grid], time, table")).toBeNull();
    expect(screen.queryByRole("tablist")).toBeNull();
    expect(container.textContent).not.toMatch(/Cricket Mtn|Horner Hell|\d:\d\d\s?(AM|PM)/i);
    expect([...container.querySelectorAll("a")].filter((a) => a.getAttribute("href")?.startsWith("/calendar"))).toEqual([]);
    expect(container.querySelector("[hidden], [style*='display: none']")).toBeNull();
  });

  it("not held: the full existing calendar experience returns, with no pause section", async () => {
    const { container } = await renderCalendar(false);
    expect(screen.getByRole("heading", { level: 1, name: "Hills on repeat." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "See you on the hill." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /New here/ })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Hills on pause." })).toBeNull();
    expect(screen.queryByRole("button", { name: "send us your questions" })).toBeNull();
    expect(container.querySelector("#upcoming")).not.toBeNull();
    expect(container.querySelector("time")).not.toBeNull();
    expect([...container.querySelectorAll("a")].some((a) => a.getAttribute("href")?.startsWith("/calendar/"))).toBe(true);
  });
});
