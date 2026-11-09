import { afterEach, describe, expect, it, vi } from "vitest";
import { conditionFromText, feelsLikeF, isDangerous, isWindy, seasonOf, windChillF } from "@/lib/weather/mapping";
import { assemble } from "@/lib/weather/assemble";
import { getWeather, parseAlerts, parseForecast, parseObservation } from "@/lib/weather/nws";
import { seasonVars } from "@/lib/weather/season";

const now = new Date("2026-11-09T16:50:00Z");

describe("weather mapping", () => {
  it("maps NWS wording to a condition, most severe first", () => {
    const cases: [string, string][] = [
      ["Sunny", "clear"], ["Mostly Sunny", "partly-cloudy"], ["Partly Cloudy", "partly-cloudy"], ["Mostly Cloudy", "cloudy"],
      ["Overcast", "cloudy"], ["Patchy Fog", "fog"], ["Light Rain", "rain"], ["Chance Showers And Thunderstorms", "thunder"],
      ["Snow Showers", "snow"], ["Freezing Rain", "mix"], ["Rain And Snow", "mix"], ["", "cloudy"],
    ];
    for (const [text, expected] of cases) expect(conditionFromText(text), text).toBe(expected);
    expect(isDangerous("thunder")).toBe(true);
    expect(isDangerous("rain")).toBe(false);
  });

  it("picks the meteorological season", () => {
    expect(["2026-03-01", "2026-06-01", "2026-09-30", "2026-12-01", "2027-02-28"].map(seasonOf)).toEqual(["spring", "summer", "autumn", "winter", "winter"]);
  });

  it("sets the tie-dye by season, not by condition", () => {
    expect(seasonVars("spring")).toMatchObject({ "--tie-wash": "var(--cmr-tint-mint-wash)" });
    expect(seasonVars("autumn")).toMatchObject({ "--tie-dye": "var(--cmr-tint-mauve-dye)", "--tie-accent": "var(--cmr-tint-peach-dye)" });
    expect(seasonVars("winter")).toMatchObject({ "--tie-dye": "var(--cmr-tint-blue-dye)" });
  });

  it("computes feels-like", () => {
    expect(Math.round(windChillF(30, 15))).toBe(19);
    expect(feelsLikeF(70, 10, 40)).toBe(70);
    expect(feelsLikeF(40, 1, 50)).toBe(40);
    expect(isWindy(20, null)).toBe(true);
    expect(isWindy(10, 31)).toBe(true);
    expect(isWindy(10, 20)).toBe(false);
  });
});

const obsJson = (over: Record<string, unknown> = {}) => ({
  properties: {
    timestamp: "2026-11-09T16:35:00+00:00",
    textDescription: "",
    temperature: { value: 13 },
    windSpeed: { value: 5.544 },
    windGust: { value: null },
    windDirection: { value: 225 },
    windChill: { value: null },
    heatIndex: { value: null },
    relativeHumidity: { value: 60 },
    ...over,
  },
});

describe("NWS parsing", () => {
  it("parses an observation and converts units", () => {
    expect(parseObservation(obsJson(), "KMDW", now)).toMatchObject({ tempF: 55, windMph: 3, windDir: "SW", text: null, station: "KMDW" });
  });

  it("treats a stale or temperature-less observation as missing", () => {
    expect(parseObservation(obsJson({ timestamp: "2026-11-09T08:00:00+00:00" }), "KMDW", now)).toBeNull();
    expect(parseObservation(obsJson({ temperature: { value: null } }), "KMDW", now)).toBeNull();
  });

  it("groups periods into days with high and low", () => {
    const p = (name: string, start: string, isDaytime: boolean, temperature: number, shortForecast: string) => ({ name, startTime: start, isDaytime, temperature, shortForecast });
    const json = {
      properties: {
        updateTime: "2026-11-09T12:30:59+00:00",
        periods: [
          p("Today", "2026-11-09T09:00:00-06:00", true, 59, "Mostly Sunny"),
          p("Tonight", "2026-11-09T18:00:00-06:00", false, 46, "Mostly Clear"),
          p("Tuesday", "2026-11-10T06:00:00-06:00", true, 59, "Chance Showers And Thunderstorms"),
          p("Tuesday Night", "2026-11-10T18:00:00-06:00", false, 44, "Cloudy"),
        ],
      },
    };
    const { days, updatedAt } = parseForecast(json);
    expect(updatedAt).toBe("2026-11-09T12:30:59+00:00");
    expect(days).toEqual([
      expect.objectContaining({ date: "2026-11-09", highF: 59, lowF: 46, condition: "partly-cloudy" }),
      expect.objectContaining({ date: "2026-11-10", highF: 59, lowF: 44, condition: "thunder" }),
    ]);
  });

  it("starts today with only a low when it is already evening", () => {
    const { days } = parseForecast({ properties: { periods: [{ startTime: "2026-11-09T18:00:00-06:00", isDaytime: false, temperature: 40, shortForecast: "Clear" }] } });
    expect(days[0]).toMatchObject({ highF: null, lowF: 40 });
  });

  it("flags warnings as urgent and sorts by severity", () => {
    const alerts = parseAlerts({
      features: [
        { properties: { id: "a", event: "Wind Advisory", severity: "Minor", headline: "h1" } },
        { properties: { id: "b", event: "Tornado Warning", severity: "Extreme", headline: "h2", ends: "2026-11-09T20:00:00Z" } },
      ],
    });
    expect(alerts.map((a) => [a.event, a.urgent])).toEqual([["Tornado Warning", true], ["Wind Advisory", false]]);
  });
});

describe("current conditions and failure states", () => {
  const forecast = { days: [{ date: "2026-11-09", highF: 59, lowF: 46, shortForecast: "Mostly Sunny", condition: "partly-cloudy" as const, precipChance: null }], updatedAt: null };

  it("labels forecast wording as a forecast, never as observed", () => {
    const obs = parseObservation(obsJson(), "KMDW", now);
    const r = assemble(now, obs, forecast, []);
    expect(r.status === "ok" && r.data.current).toMatchObject({ source: "forecast", text: "Mostly Sunny" });
    const r2 = assemble(now, parseObservation(obsJson({ textDescription: "Light Rain" }), "KMDW", now), forecast, []);
    expect(r2.status === "ok" && r2.data.current).toMatchObject({ source: "observed", condition: "rain" });
  });

  it("degrades: forecast only, observation only, and unavailable", () => {
    expect(assemble(now, null, forecast, null)).toMatchObject({ status: "ok", data: { observation: null, alerts: null } });
    expect(assemble(now, parseObservation(obsJson(), "KMDW", now), null, []).status).toBe("ok");
    expect(assemble(now, null, null, [])).toEqual({ status: "unavailable" });
  });

  describe("getWeather", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("is unavailable, and does not throw, when every request fails", async () => {
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
      expect(await getWeather(now)).toEqual({ status: "unavailable" });
    });

    it("sends an identifying User-Agent and no credentials", async () => {
      const fetchMock = vi.fn().mockRejectedValue(new Error("x"));
      vi.stubGlobal("fetch", fetchMock);
      await getWeather(now);
      const init = fetchMock.mock.calls[0][1];
      expect(init.headers["User-Agent"]).toMatch(/ChicagoMountainRunners/);
      expect(JSON.stringify(init.headers)).not.toMatch(/authorization|key/i);
      expect(init.next.revalidate).toBeGreaterThan(0);
    });
  });
});
