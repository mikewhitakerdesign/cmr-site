import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WeatherCompactView } from "@/components/weather/WeatherCompact";
import { WeatherGuidance } from "@/components/weather/WeatherGuidance";
import { WeatherPanelSkeleton, WeatherPanelView } from "@/components/weather/WeatherPanel";
import { assemble } from "@/lib/weather/assemble";
import type { DayForecast, Observation, WeatherAlert, WeatherResult } from "@/lib/weather/types";
import { axeViolations } from "../../axe";

const now = new Date("2026-11-09T16:50:00Z"); // Monday, November 9, Chicago
const obs: Observation = { at: "2026-11-09T16:35:00Z", station: "KMDW", tempF: 55, feelsLikeF: 52, windMph: 9, gustMph: null, windDir: "SW", text: "Partly Cloudy" };
const day = (i: number, condition: DayForecast["condition"] = "clear"): DayForecast => ({ date: `2026-11-${String(9 + i).padStart(2, "0")}`, highF: 60 - i, lowF: 40 - i, shortForecast: "Sunny", condition, precipChance: null });
const days = [0, 1, 2, 3, 4].map((i) => day(i));
const ok = (o: Observation | null = obs, alerts: WeatherAlert[] | null = [], d = days): WeatherResult => assemble(now, o, { days: d, updatedAt: "2026-11-09T15:00:00Z" }, alerts);

describe("WeatherPanelView", () => {
  it("labels current weather with today's Chicago date and shows temperature, conditions, feels-like and wind", () => {
    render(<WeatherPanelView result={ok()} now={now} />);
    const region = screen.getByRole("region", { name: "Current weather" });
    expect(within(region).getByText("Monday, November 9")).toBeInTheDocument();
    expect(within(region).getByText(/55°/)).toBeInTheDocument();
    expect(within(region).getByText("Partly Cloudy")).toBeInTheDocument();
    expect(within(region).getByText("52°")).toBeInTheDocument();
    expect(within(region).getByText("9 mph SW")).toBeInTheDocument();
    expect(region).toHaveAttribute("data-season", "autumn");
    expect(region).toHaveAttribute("data-weather", "ok");
  });

  it("shows provider timestamps and a five-day band with highs and lows", () => {
    render(<WeatherPanelView result={ok()} now={now} />);
    expect(screen.getByText(/Observed 10:35 AM CST at Midway Airport/)).toBeInTheDocument();
    expect(screen.getByText(/Forecast updated 9:00 AM CST/)).toBeInTheDocument();
    const band = screen.getByRole("list", { name: "Five-day forecast" });
    const items = within(band).getAllByRole("listitem");
    expect(items).toHaveLength(5);
    expect(within(items[0]).getByText("Today")).toBeInTheDocument();
    expect(within(items[1]).getByText("Tue")).toBeInTheDocument();
    expect(within(items[1]).getByText("59°")).toBeInTheDocument();
    expect(within(items[1]).getByText("39°")).toBeInTheDocument();
  });

  it("says when the description comes from the forecast, not the station", () => {
    render(<WeatherPanelView result={ok({ ...obs, text: null })} now={now} />);
    expect(screen.getByText(/The station gave no conditions, so the description is from today.s forecast/)).toBeInTheDocument();
  });

  it("without a station reading, never invents a temperature", () => {
    render(<WeatherPanelView result={ok(null)} now={now} />);
    expect(screen.getByText(/No current station reading is available/)).toBeInTheDocument();
    expect(screen.queryByText("55°")).toBeNull();
  });

  it("shows warnings as NWS alerts with the stay-home line, separate from schedule changes", () => {
    const warn: WeatherAlert = { id: "1", event: "Severe Thunderstorm Warning", headline: "h", urgent: true, ends: null };
    render(<WeatherPanelView result={ok({ ...obs, text: "Thunderstorm" }, [warn])} now={now} />);
    const list = screen.getByRole("list", { name: "Active weather alerts" });
    expect(within(list).getByText("Severe Thunderstorm Warning")).toBeInTheDocument();
    expect(within(list).getByText(/Weather alert · National Weather Service/)).toBeInTheDocument();
    expect(screen.getByText(/Stay safe and stay home/)).toBeInTheDocument();
    expect(screen.queryByText(/cancelled/i)).toBeNull();
  });

  it("makes no safety claim when there are no alerts, and says when alerts could not be checked", () => {
    const { unmount } = render(<WeatherPanelView result={ok()} now={now} />);
    expect(screen.queryByText(/safe/i)).toBeNull();
    expect(screen.queryByRole("list", { name: "Active weather alerts" })).toBeNull();
    expect(screen.getByText(/never cancels a run by itself/)).toBeInTheDocument();
    unmount();
    render(<WeatherPanelView result={ok(obs, null)} now={now} />);
    expect(screen.getByText(/Weather alerts could not be checked/)).toBeInTheDocument();
  });

  it("degrades to an unavailable state that points to the NWS and leaves the schedule alone", () => {
    render(<WeatherPanelView result={{ status: "unavailable" }} now={now} />);
    expect(screen.getByText("Weather is unavailable right now.")).toBeInTheDocument();
    expect(screen.getByText(/The schedule is unaffected/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /National Weather Service forecast for Chicago/ })).toHaveAttribute("href", expect.stringContaining("weather.gov"));
  });

  it("has a loading state", () => {
    render(<WeatherPanelSkeleton now={now} />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading Chicago weather");
  });

  it("styles the underlying season (winter, spring, summer) apart from the condition", () => {
    for (const [date, season, wash] of [["2026-01-15T18:00:00Z", "winter", "lavender"], ["2026-04-15T18:00:00Z", "spring", "mint"], ["2026-07-15T18:00:00Z", "summer", "peach"]] as const) {
      const n = new Date(date);
      const { container, unmount } = render(<WeatherPanelView result={assemble(n, { ...obs, at: n.toISOString() }, { days: [{ ...day(0), date: date.slice(0, 10) }], updatedAt: null }, [])} now={n} />);
      const el = container.querySelector("section")!;
      expect(el).toHaveAttribute("data-season", season);
      expect(el.getAttribute("style")).toContain(`--cmr-tint-${wash}-wash`);
      unmount();
    }
  });

  it("has no axe violations", async () => {
    const { container } = render(<WeatherPanelView result={ok()} now={now} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("WeatherCompactView", () => {
  it("is compact: no five-day band, and the run-day forecast is labelled as a forecast", () => {
    render(<WeatherCompactView result={ok()} now={now} runDate="2026-11-11" />);
    expect(screen.queryByRole("list", { name: "Five-day forecast" })).toBeNull();
    expect(screen.getByText("Current weather")).toBeInTheDocument();
    expect(screen.getByText(/Feels like 52°/)).toBeInTheDocument();
    expect(screen.getByText(/Forecast for Wed, Nov 11:/)).toBeInTheDocument();
  });

  it("omits the run-day line beyond the forecast and degrades when unavailable", () => {
    const { unmount } = render(<WeatherCompactView result={ok()} now={now} runDate="2026-12-20" />);
    expect(screen.queryByText(/Forecast for/)).toBeNull();
    unmount();
    render(<WeatherCompactView result={{ status: "unavailable" }} now={now} />);
    expect(screen.getByText(/Weather is unavailable right now. The schedule is unaffected/)).toBeInTheDocument();
  });
});

describe("WeatherGuidance", () => {
  it("uses the approved copy", () => {
    render(<WeatherGuidance />);
    expect(screen.getByRole("heading", { level: 2, name: "Bad weather. Good hills." })).toBeInTheDocument();
    expect(screen.getByText("Rain, wind, snow, cold, heat. We're not particularly picky.")).toBeInTheDocument();
    expect(screen.getByText(/Lightning, thunderstorms, tornado warnings, and other dangerous conditions are a different story. Stay safe and stay home./)).toBeInTheDocument();
    expect(screen.getByText(/participate at your own risk. Check for schedule updates before heading out./)).toBeInTheDocument();
  });
});
