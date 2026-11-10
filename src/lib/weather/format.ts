import { CLUB_TIME_ZONE, formatLongDate, weekdayName, type IsoDate } from "@/lib/schedule";

const clock = new Intl.DateTimeFormat("en-US", {
  timeZone: CLUB_TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
});

/** "10:35 AM CST", in Chicago time, for provider timestamps. */
export const formatClock = (iso: string): string => clock.format(new Date(iso));

export const degrees = (n: number | null | undefined): string => (n == null ? "–" : `${n}°`);

export const shortWeekday = (date: IsoDate): string => weekdayName(date).slice(0, 3);

/** "Monday, November 9", today's Chicago date. */
export const todayLabel = (date: IsoDate): string => formatLongDate(date);

export function windText(o: { windMph: number | null; gustMph: number | null; windDir: string | null }): string {
  if (o.windMph == null) return "Not reported";
  if (o.windMph < 1) return "Calm";
  const base = `${o.windMph} mph${o.windDir ? ` ${o.windDir}` : ""}`;
  return o.gustMph && o.gustMph > o.windMph + 4 ? `${base}, gusts ${o.gustMph}` : base;
}

export const NWS_FORECAST_URL = "https://forecast.weather.gov/MapClick.php?lat=41.8781&lon=-87.6298";
