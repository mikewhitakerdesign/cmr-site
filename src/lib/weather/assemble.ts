import { toClubTime } from "@/lib/schedule";
import { conditionFromText, isDaytime, isWindy } from "@/lib/weather/mapping";
import type { CurrentConditions, DayForecast, Observation, WeatherAlert, WeatherData, WeatherResult } from "@/lib/weather/types";

/** Pure: "right now", from the station when it says something, else the forecast, labelled as such. */
export function currentFrom(obs: Observation | null, today: DayForecast | undefined, now: Date): CurrentConditions | null {
  const windy = isWindy(obs?.windMph ?? null, obs?.gustMph ?? null);
  const isDay = isDaytime(now);
  if (obs?.text) return { condition: conditionFromText(obs.text), text: obs.text, source: "observed", isDay, windy };
  if (today) return { condition: today.condition, text: today.shortForecast, source: "forecast", isDay, windy };
  return null;
}

export function assemble(
  now: Date,
  obs: Observation | null,
  forecast: { days: DayForecast[]; updatedAt: string | null } | null,
  alerts: WeatherAlert[] | null,
): WeatherResult {
  if (!obs && !forecast) return { status: "unavailable" };
  const today = toClubTime(now).date;
  const days = (forecast?.days ?? []).filter((d) => d.date >= today);
  const data: WeatherData = {
    fetchedAt: now.toISOString(),
    observation: obs,
    current: currentFrom(obs, days[0], now),
    days,
    forecastUpdatedAt: forecast?.updatedAt ?? null,
    alerts,
  };
  return { status: "ok", data };
}

