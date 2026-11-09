/* eslint-disable @typescript-eslint/no-explicit-any -- provider JSON is untyped and parsed defensively below */
import { assemble } from "@/lib/weather/assemble";
import { fixtureWeather } from "@/lib/weather/fixtures";
import {
  compass,
  conditionFromText,
  cToF,
  feelsLikeF,
  isUrgentAlert,
  kmhToMph,
} from "@/lib/weather/mapping";
import type { DayForecast, Observation, WeatherAlert, WeatherResult } from "@/lib/weather/types";

/**
 * Chicago weather from the National Weather Service API (api.weather.gov):
 * free, no key, read-only. Server side only; the browser never calls it.
 * Owner-authorized for this one bounded use (.aiom/approvals/
 * implement-cmr-find-a-run-weather-approval.yaml). Informational only: nothing
 * here decides or implies a cancellation.
 *
 * NWS asks for an identifying User-Agent (no personal data is sent) and
 * publishes cache hints, followed through the fetch cache below.
 *
 * The forecast grid (LOT 76,73) and stations are from /points/41.8781,-87.6298
 * (2026-11-09). Observations come from Midway (KMDW), then O'Hare (KORD).
 */
const API = "https://api.weather.gov";
const POINT = "41.8781,-87.6298";
const FORECAST = `${API}/gridpoints/LOT/76,73/forecast`;
const STATIONS = ["KMDW", "KORD"];
const HEADERS = {
  "User-Agent": "ChicagoMountainRunnersSite/1.0 (club website, read-only weather)",
  Accept: "application/geo+json",
};
/** Seconds each response may be reused: observations 5 min, forecast 30 min, alerts 1 min. */
export const TTL = { observation: 300, forecast: 1800, alerts: 60 } as const;
const TIMEOUT_MS = 6000;
/** An observation older than this is treated as missing rather than shown as "current". */
const STALE_OBSERVATION_MS = 3 * 3600_000;

async function getJson(url: string, revalidate: number): Promise<any> {
  const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(TIMEOUT_MS), next: { revalidate } });
  if (!res.ok) throw new Error(`NWS ${res.status}`);
  return res.json();
}

type Quantity = { value: number | null } | undefined;
const q = (x: Quantity): number | null => (typeof x?.value === "number" ? x.value : null);
const round = (n: number | null) => (n == null ? null : Math.round(n));

/** Pure: an NWS observation feature → Observation (null when unusable or stale). */
export function parseObservation(json: any, station: string, now: Date): Observation | null {
  const p = json?.properties;
  if (!p?.timestamp) return null;
  if (now.getTime() - new Date(p.timestamp).getTime() > STALE_OBSERVATION_MS) return null;
  const tempC = q(p.temperature);
  if (tempC == null) return null;
  const tempF = cToF(tempC);
  const wind = q(p.windSpeed) != null ? kmhToMph(q(p.windSpeed) as number) : null;
  const gust = q(p.windGust) != null ? kmhToMph(q(p.windGust) as number) : null;
  const chillC = q(p.windChill);
  const heatC = q(p.heatIndex);
  const feels = chillC != null ? cToF(chillC) : heatC != null ? cToF(heatC) : feelsLikeF(tempF, wind, q(p.relativeHumidity));
  const dir = q(p.windDirection);
  return {
    at: p.timestamp,
    station,
    tempF: round(tempF),
    feelsLikeF: round(feels),
    windMph: round(wind),
    gustMph: round(gust),
    windDir: dir != null && (wind ?? 0) >= 1 ? compass(dir) : null,
    text: typeof p.textDescription === "string" && p.textDescription.trim() ? p.textDescription.trim() : null,
  };
}

/** Pure: forecast periods → up to five days with high, low, wording and condition. */
export function parseForecast(json: any): { days: DayForecast[]; updatedAt: string | null } {
  const periods: any[] = json?.properties?.periods ?? [];
  const byDate = new Map<string, { day?: any; night?: any }>();
  for (const p of periods) {
    const date = String(p.startTime).slice(0, 10); // NWS start times carry the Chicago offset
    const slot = byDate.get(date) ?? {};
    if (p.isDaytime) slot.day ??= p;
    else slot.night ??= p;
    byDate.set(date, slot);
  }
  const days = [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 5)
    .map(([date, { day, night }]): DayForecast => {
      const main = day ?? night;
      return {
        date,
        highF: day ? round(day.temperature) : null,
        lowF: night ? round(night.temperature) : null,
        shortForecast: String(main.shortForecast ?? ""),
        condition: conditionFromText(main.shortForecast),
        precipChance: typeof main.probabilityOfPrecipitation?.value === "number" ? main.probabilityOfPrecipitation.value : null,
      };
    });
  return { days, updatedAt: json?.properties?.updateTime ?? json?.properties?.generatedAt ?? null };
}

const SEVERITY_ORDER = ["Extreme", "Severe", "Moderate", "Minor", "Unknown"];

/** Pure: active alerts, most severe first. */
export function parseAlerts(json: any): WeatherAlert[] {
  const features: any[] = json?.features ?? [];
  return features
    .map((f) => f.properties)
    .filter((p) => p?.event)
    .sort((a, b) => SEVERITY_ORDER.indexOf(a.severity ?? "Unknown") - SEVERITY_ORDER.indexOf(b.severity ?? "Unknown"))
    .map((p) => ({
      id: String(p.id ?? p.event),
      event: String(p.event),
      headline: String(p.headline ?? p.event),
      urgent: isUrgentAlert(p),
      ends: p.ends ?? p.expires ?? null,
    }));
}

async function observation(now: Date): Promise<Observation | null> {
  for (const station of STATIONS) {
    try {
      const obs = parseObservation(await getJson(`${API}/stations/${station}/observations/latest`, TTL.observation), station, now);
      if (obs) return obs;
    } catch {
      /* try the next station */
    }
  }
  return null;
}

/** Chicago weather, or `unavailable`. Never throws: the schedule must work without it. */
export async function getWeather(now: Date = new Date()): Promise<WeatherResult> {
  const fixture = fixtureWeather(now);
  if (fixture) return fixture;
  const [obs, forecast, alerts] = await Promise.allSettled([
    observation(now),
    getJson(FORECAST, TTL.forecast).then(parseForecast),
    getJson(`${API}/alerts/active?point=${POINT}`, TTL.alerts).then(parseAlerts),
  ]);
  return assemble(
    now,
    obs.status === "fulfilled" ? obs.value : null,
    forecast.status === "fulfilled" ? forecast.value : null,
    alerts.status === "fulfilled" ? alerts.value : null,
  );
}
