import { toClubTime, type IsoDate } from "@/lib/schedule";
import type { Condition, Season, WeatherAlert } from "@/lib/weather/types";

/** Meteorological seasons: spring Mar to May, summer Jun to Aug, autumn Sep to Nov, winter Dec to Feb. */
export function seasonOf(date: IsoDate): Season {
  const m = Number(date.slice(5, 7));
  if (m >= 3 && m <= 5) return "spring";
  if (m >= 6 && m <= 8) return "summer";
  if (m >= 9 && m <= 11) return "autumn";
  return "winter";
}

/** Maps NWS forecast or observation wording to one condition. Order matters: the most severe wins. */
export function conditionFromText(text: string | null | undefined): Condition {
  const t = (text ?? "").toLowerCase();
  if (/thunder|lightning|t-?storm/.test(t)) return "thunder";
  if (/freezing|sleet|wintry|ice pellets|rain and snow|snow and rain|mix/.test(t)) return "mix";
  if (/snow|flurr|blizzard/.test(t)) return "snow";
  if (/rain|shower|drizzle/.test(t)) return "rain";
  if (/fog|mist|haze|smoke/.test(t)) return "fog";
  if (/partly|mostly sunny|mostly clear|few clouds|scattered clouds|sunny intervals/.test(t)) return "partly-cloudy";
  if (/cloud|overcast/.test(t)) return "cloudy";
  if (/sunny|clear|fair/.test(t)) return "clear";
  return "cloudy";
}

/** Conditions a person should not run in. Informational only; never cancels anything. */
export const isDangerous = (c: Condition) => c === "thunder";

export const isWindy = (windMph: number | null, gustMph: number | null) => (windMph ?? 0) >= 20 || (gustMph ?? 0) >= 30;

export const cToF = (c: number) => (c * 9) / 5 + 32;
export const kmhToMph = (k: number) => k / 1.609344;

/** NWS wind chill, valid at 50°F or below and 3 mph or more. */
export function windChillF(tempF: number, windMph: number): number {
  const v = Math.pow(windMph, 0.16);
  return 35.74 + 0.6215 * tempF - 35.75 * v + 0.4275 * tempF * v;
}

/** NWS heat index (Rothfusz), valid at 80°F or above. */
export function heatIndexF(t: number, rh: number): number {
  return (
    -42.379 + 2.04901523 * t + 10.14333127 * rh - 0.22475541 * t * rh - 0.00683783 * t * t - 0.05481717 * rh * rh +
    0.00122874 * t * t * rh + 0.00085282 * t * rh * rh - 0.00000199 * t * t * rh * rh
  );
}

export function feelsLikeF(tempF: number, windMph: number | null, humidityPct: number | null): number {
  if (tempF <= 50 && (windMph ?? 0) >= 3) return windChillF(tempF, windMph as number);
  if (tempF >= 80 && humidityPct != null) return heatIndexF(tempF, humidityPct);
  return tempF;
}

const COMPASS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
export const compass = (deg: number) => COMPASS[Math.round((((deg % 360) + 360) % 360) / 22.5) % 16];

/** Daytime at an instant in Chicago, roughly 6 AM to 6 PM (icon variant only, not astronomy). */
export function isDaytime(instant: Date): boolean {
  const h = Number(toClubTime(instant).time.slice(0, 2));
  return h >= 6 && h < 18;
}

export function isUrgentAlert(a: { event: string; severity?: string | null }): boolean {
  return /warning|emergency/i.test(a.event) || a.severity === "Severe" || a.severity === "Extreme";
}

export const hasUrgent = (alerts: WeatherAlert[] | null) => !!alerts?.some((a) => a.urgent);
