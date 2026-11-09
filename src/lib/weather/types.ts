import type { IsoDate } from "@/lib/schedule";

/** What the icon and illustration show. Wind is an overlay flag, not a condition of its own. */
export type Condition = "clear" | "partly-cloudy" | "cloudy" | "fog" | "rain" | "thunder" | "snow" | "mix";
export type Season = "spring" | "summer" | "autumn" | "winter";

/** An actual station reading. Never filled in from a forecast. */
export interface Observation {
  /** ISO instant the station reported. */
  at: string;
  station: string;
  tempF: number | null;
  feelsLikeF: number | null;
  windMph: number | null;
  gustMph: number | null;
  windDir: string | null;
  /** The station's own words ("Light Rain"); often missing. */
  text: string | null;
}

export interface DayForecast {
  date: IsoDate;
  highF: number | null;
  lowF: number | null;
  shortForecast: string;
  condition: Condition;
  precipChance: number | null;
}

export interface WeatherAlert {
  id: string;
  event: string;
  headline: string;
  /** Warnings, emergencies and severe or extreme alerts. */
  urgent: boolean;
  ends: string | null;
}

/** What "right now" shows, and where it came from, so a forecast is never labelled as observed. */
export interface CurrentConditions {
  condition: Condition;
  text: string;
  source: "observed" | "forecast";
  isDay: boolean;
  windy: boolean;
}

export interface WeatherData {
  /** When the site fetched this (not a provider timestamp). */
  fetchedAt: string;
  observation: Observation | null;
  current: CurrentConditions | null;
  days: DayForecast[];
  /** The forecast's own update time. */
  forecastUpdatedAt: string | null;
  /** `null` = the alert check failed, which is not the same as "no alerts". */
  alerts: WeatherAlert[] | null;
}

export type WeatherResult = { status: "ok"; data: WeatherData } | { status: "unavailable" };
