import { addDays, toClubTime } from "@/lib/schedule";
import { assemble } from "@/lib/weather/assemble";
import type { DayForecast, Observation, WeatherAlert, WeatherResult } from "@/lib/weather/types";

/**
 * Canned weather for browser tests and screenshots, selected by the
 * CMR_WEATHER_FIXTURE environment variable (never set in production). It keeps
 * the end-to-end suite off the live National Weather Service API.
 *
 *   ok       mild day, partly cloudy, no alerts
 *   storm    thunderstorms and a Severe Thunderstorm Warning
 *   error    the provider is unavailable
 */
export function fixtureWeather(now: Date): WeatherResult | null {
  const mode = process.env.CMR_WEATHER_FIXTURE;
  if (!mode) return null;
  if (mode === "error") return { status: "unavailable" };
  const today = toClubTime(now).date;
  const storm = mode === "storm";
  const obs: Observation = {
    at: new Date(now.getTime() - 20 * 60_000).toISOString(),
    station: "KMDW",
    tempF: storm ? 74 : 52,
    feelsLikeF: storm ? 77 : 47,
    windMph: storm ? 24 : 9,
    gustMph: storm ? 38 : null,
    windDir: "SW",
    text: storm ? "Thunderstorm" : "Partly Cloudy",
  };
  const shapes: [string, DayForecast["condition"], number, number][] = storm
    ? [["Thunderstorms", "thunder", 78, 62], ["Showers Likely", "rain", 70, 55], ["Mostly Cloudy", "cloudy", 66, 50], ["Sunny", "clear", 72, 54], ["Chance Rain Showers", "rain", 68, 52]]
    : [["Partly Sunny", "partly-cloudy", 56, 41], ["Sunny", "clear", 59, 44], ["Chance Rain Showers", "rain", 51, 40], ["Mostly Cloudy", "cloudy", 47, 36], ["Chance Snow Showers", "snow", 38, 28]];
  const days = shapes.map(([shortForecast, condition, highF, lowF], i): DayForecast => ({
    date: addDays(today, i),
    highF,
    lowF,
    shortForecast,
    condition,
    precipChance: condition === "rain" || condition === "thunder" ? 60 : null,
  }));
  const alerts: WeatherAlert[] = storm
    ? [{ id: "fixture", event: "Severe Thunderstorm Warning", headline: "Severe Thunderstorm Warning for Cook County", urgent: true, ends: null }]
    : [];
  return assemble(now, obs, { days, updatedAt: new Date(now.getTime() - 3600_000).toISOString() }, alerts);
}
