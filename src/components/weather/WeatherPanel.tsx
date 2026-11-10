import { Suspense } from "react";
import { WeatherArt } from "@/components/weather/WeatherArt";
import { WeatherGlyph } from "@/components/weather/WeatherGlyph";
import { toClubTime } from "@/lib/schedule";
import { degrees, formatClock, NWS_FORECAST_URL, shortWeekday, todayLabel, windText } from "@/lib/weather/format";
import { hasUrgent, isDangerous, seasonOf } from "@/lib/weather/mapping";
import { getWeather } from "@/lib/weather/nws";
import { seasonVars } from "@/lib/weather/season";
import type { WeatherAlert, WeatherData, WeatherResult } from "@/lib/weather/types";
import { cn } from "@/lib/utils";

const LABEL = "font-mono text-[13px] leading-5 tracking-[0.1em] uppercase";
const SHELL =
  "relative isolate overflow-hidden rounded-lg border border-foreground/15 bg-(--tie-wash) p-5 text-foreground md:p-6";

function Shell({ season, children, ...rest }: { season: ReturnType<typeof seasonOf>; children: React.ReactNode } & React.HTMLAttributes<HTMLElement>) {
  return (
    <section style={seasonVars(season)} data-season={season} {...rest} className={cn(SHELL, rest.className)}>
      <div aria-hidden className="cmr-tie-dye absolute -z-10 opacity-80" />
      {children}
    </section>
  );
}

/**
 * Full weather module for the Find a Run hero. Server Component: fetches on the
 * server (cached by the fetch layer), streams behind a skeleton, and never
 * throws. It always shows *today's* weather, whatever date the calendar is on.
 */
export function WeatherPanel({ now }: { now: Date }) {
  return (
    <Suspense fallback={<WeatherPanelSkeleton now={now} />}>
      <WeatherPanelData now={now} />
    </Suspense>
  );
}

async function WeatherPanelData({ now }: { now: Date }) {
  return <WeatherPanelView result={await getWeather(now)} now={now} />;
}

export function WeatherPanelSkeleton({ now }: { now: Date }) {
  const today = toClubTime(now).date;
  return (
    <Shell season={seasonOf(today)} aria-busy="true" aria-labelledby="wx-title" data-weather="loading">
      <p id="wx-title" className={LABEL}>
        Current weather
      </p>
      <p className="mt-1 text-p-sm text-foreground/75">{todayLabel(today)}</p>
      <p role="status" className="mt-8 text-p text-foreground/75">
        Loading Chicago weather…
      </p>
      <div aria-hidden className="mt-8 grid h-24 grid-cols-5 gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="rounded-md bg-foreground/5 motion-safe:animate-pulse" />
        ))}
      </div>
    </Shell>
  );
}

export function WeatherPanelView({ result, now }: { result: WeatherResult; now: Date }) {
  const today = toClubTime(now).date;
  const season = seasonOf(today);

  if (result.status !== "ok") {
    return (
      <Shell season={season} aria-labelledby="wx-title" data-weather="unavailable">
        <p id="wx-title" className={LABEL}>
          Current weather
        </p>
        <p className="mt-1 text-p-sm text-foreground/75">{todayLabel(today)}</p>
        <p className="mt-6 text-h4 font-semibold tracking-[-0.5px]">Weather is unavailable right now.</p>
        <p className="mt-2 text-p text-foreground/75">
          The schedule is unaffected. For current conditions, see the{" "}
          <a href={NWS_FORECAST_URL} rel="noopener noreferrer" className="underline underline-offset-4">
            National Weather Service forecast for Chicago
          </a>
          .
        </p>
      </Shell>
    );
  }

  const { data } = result;
  const { observation: obs, current, days } = data;
  const dangerous = (current && isDangerous(current.condition)) || hasUrgent(data.alerts);

  return (
    <Shell season={season} aria-labelledby="wx-title" data-weather="ok" data-condition={current?.condition}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p id="wx-title" className={LABEL}>
          Current weather
        </p>
        <p className="text-p-sm text-foreground/75">
          <time dateTime={today}>{todayLabel(today)}</time>
        </p>
      </div>

      <div className="mt-5 flex items-center gap-4 md:gap-5">
        <WeatherArt
          condition={current?.condition ?? "cloudy"}
          season={season}
          isDay={current?.isDay ?? true}
          windy={current?.windy}
          className="size-24 md:size-28"
        />
        <div className="min-w-0">
          <p className="text-[56px] leading-none font-black tracking-[-0.045em] md:text-[64px]">
            {obs?.tempF != null ? degrees(obs.tempF) : "–"}
            <span className="sr-only"> degrees Fahrenheit</span>
          </p>
          <p className="mt-1 text-h4 leading-[1.2] font-semibold tracking-[-0.5px]">
            {current ? current.text : "Conditions unavailable"}
          </p>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-1 border-t border-foreground/15 pt-4 text-p-sm">
        <div>
          <dt className="text-foreground/75">Feels like</dt>
          <dd className="font-semibold">{obs ? degrees(obs.feelsLikeF) : "–"}</dd>
        </div>
        <div>
          <dt className="text-foreground/75">Wind</dt>
          <dd className="font-semibold">{obs ? windText(obs) : "–"}</dd>
        </div>
      </dl>

      <p className="mt-3 text-[13px] leading-5 text-foreground/75" data-slot="provenance">
        {obs ? (
          <>
            Observed {formatClock(obs.at)} at {obs.station === "KMDW" ? "Midway Airport" : "O’Hare Airport"}.
            {current?.source === "forecast" && " The station gave no conditions, so the description is from today’s forecast."}
          </>
        ) : (
          <>No current station reading is available. The description is from today&apos;s forecast.</>
        )}
      </p>

      <Alerts alerts={data.alerts} dangerous={!!dangerous} />

      {days.length > 0 && (
        <ol aria-label="Five-day forecast" className="mt-5 grid grid-cols-5 gap-1.5 border-t border-foreground/15 pt-4 md:gap-2">
          {days.map((d, i) => (
            <li key={d.date} data-date={d.date} className="flex flex-col items-center text-center">
              <span className="text-[13px] leading-5 font-semibold">{i === 0 ? "Today" : shortWeekday(d.date)}</span>
              <WeatherGlyph condition={d.condition} isDay className="my-1 size-9 md:size-10" />
              <span className="sr-only">{d.shortForecast}. </span>
              <span className="text-p-sm font-semibold">
                <span className="sr-only">High </span>
                {degrees(d.highF)}
              </span>
              <span className="text-p-sm text-foreground/75">
                <span className="sr-only">Low </span>
                {degrees(d.lowF)}
              </span>
            </li>
          ))}
        </ol>
      )}

      <p className="mt-4 text-[12px] leading-[18px] text-foreground/75">
        {data.forecastUpdatedAt ? `Forecast updated ${formatClock(data.forecastUpdatedAt)}. ` : ""}
        Source: National Weather Service. Weather is information only and never cancels a run by itself.
      </p>
    </Shell>
  );
}

/** NWS alerts and the safety line. Not the club's schedule changes, which are labelled separately. */
export function Alerts({ alerts, dangerous }: { alerts: WeatherAlert[] | null; dangerous: boolean }) {
  return (
    <>
      {alerts === null && (
        <p data-slot="alerts-unchecked" className="mt-3 text-[13px] leading-5 text-foreground/75">
          Weather alerts could not be checked. Look at the{" "}
          <a href={NWS_FORECAST_URL} rel="noopener noreferrer" className="underline underline-offset-4">
            National Weather Service
          </a>{" "}
          before heading out.
        </p>
      )}
      {alerts && alerts.length > 0 && (
        <ul aria-label="Active weather alerts" data-slot="alerts" className="mt-4 flex flex-col gap-2">
          {alerts.slice(0, 3).map((a) => (
            <li
              key={a.id}
              className={cn(
                "rounded-md border px-3 py-2",
                a.urgent ? "border-foreground bg-foreground text-background" : "border-foreground/40 bg-background/70",
              )}
            >
              <p className="font-mono text-[12px] leading-4 tracking-[0.1em] uppercase">Weather alert · National Weather Service</p>
              <p className="mt-0.5 text-p-sm font-semibold">{a.event}</p>
            </li>
          ))}
        </ul>
      )}
      {dangerous && (
        <p data-slot="danger-note" className="mt-3 text-p-sm font-semibold">
          Lightning and thunderstorms are not running weather. Stay safe and stay home.
        </p>
      )}
    </>
  );
}

export type { WeatherData };
