import { Suspense } from "react";
import { Alerts } from "@/components/weather/WeatherPanel";
import { WeatherArt } from "@/components/weather/WeatherArt";
import { formatShortDate, toClubTime, type IsoDate } from "@/lib/schedule";
import { degrees, formatClock, NWS_FORECAST_URL, todayLabel, windText } from "@/lib/weather/format";
import { hasUrgent, isDangerous, seasonOf } from "@/lib/weather/mapping";
import { getWeather } from "@/lib/weather/nws";
import { seasonVars } from "@/lib/weather/season";
import type { WeatherResult } from "@/lib/weather/types";

const LABEL = "font-mono text-[13px] leading-5 tracking-[0.1em] uppercase";

/**
 * Compact weather for run detail pages: today's conditions in a few lines, plus
 * the forecast for the run's day when the forecast reaches it (clearly labelled
 * as a forecast). The full five-day band lives on /calendar only.
 */
export function WeatherCompact({ now, runDate, floating }: { now: Date; runDate?: IsoDate; floating?: boolean }) {
  return (
    <Suspense fallback={<Frame now={now} state="loading" floating={floating} />}>
      <CompactData now={now} runDate={runDate} floating={floating} />
    </Suspense>
  );
}

async function CompactData({ now, runDate, floating }: { now: Date; runDate?: IsoDate; floating?: boolean }) {
  return <WeatherCompactView result={await getWeather(now)} now={now} runDate={runDate} floating={floating} />;
}

type Placement = "float" | "stack";

/**
 * `floating` is for the run page's map: the card overlaps the map's upper-right
 * corner (on mobile it sits across the map's top edge). It stays "float" only
 * while its content is short; alerts, an unchecked-alerts notice, an unavailable
 * state or unusually long text switch it to "stack" (full width, below the map)
 * so nothing is clipped and nothing covers the pin. The parent must be a
 * `relative flex flex-col` that also holds the map.
 */
const SHADOW = "shadow-[0_18px_32px_rgba(65,65,65,0.42)]";
const CARD = "relative isolate overflow-hidden rounded-lg border border-foreground/10 bg-(--tie-wash) text-foreground";
const PLACE: Record<Placement | "plain", string> = {
  float: `${CARD} ${SHADOW} order-first z-10 mx-4 -mb-9 p-4 md:absolute md:top-[-22px] md:right-[-14px] md:order-none md:z-10 md:mx-0 md:mb-0 md:w-[280px] md:p-4 lg:right-[-18px]`,
  stack: `${CARD} ${SHADOW} order-last mt-6 p-5`,
  plain: `${CARD} p-5`,
};

function Frame({ now, state, children, floating, placement }: { now: Date; state: "loading" | "unavailable" | "ok"; children?: React.ReactNode; floating?: boolean; placement?: Placement }) {
  const today = toClubTime(now).date;
  const season = seasonOf(today);
  const place: Placement | "plain" = !floating ? "plain" : state === "unavailable" ? "stack" : (placement ?? "float");
  return (
    <section
      aria-labelledby="wx-compact-title"
      aria-busy={state === "loading" || undefined}
      data-weather={state}
      data-variant="compact"
      data-placement={floating ? place : undefined}
      style={seasonVars(season)}
      className={PLACE[place]}
    >
      <div aria-hidden className="cmr-tie-dye absolute -z-10 opacity-80" />
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <p id="wx-compact-title" className={LABEL}>
          Current weather
        </p>
        <p className="text-p-sm text-foreground/75">
          <time dateTime={today}>{todayLabel(today)}</time>
        </p>
      </div>
      {state === "loading" && (
        <p role="status" className="mt-3 text-p-sm text-foreground/75">
          Loading Chicago weather…
        </p>
      )}
      {state === "unavailable" && (
        <p className="mt-3 text-p-sm text-foreground/75">
          Weather is unavailable right now. The schedule is unaffected. See the{" "}
          <a href={NWS_FORECAST_URL} rel="noopener noreferrer" className="underline underline-offset-4">
            National Weather Service forecast
          </a>
          .
        </p>
      )}
      {children}
    </section>
  );
}

const LONG_TEXT = 34;

export function WeatherCompactView({ result, now, runDate, floating }: { result: WeatherResult; now: Date; runDate?: IsoDate; floating?: boolean }) {
  if (result.status !== "ok") return <Frame now={now} state="unavailable" floating={floating} />;
  const { data } = result;
  const { observation: obs, current } = data;
  const season = seasonOf(toClubTime(now).date);
  const runDay = runDate ? data.days.find((d) => d.date === runDate) : undefined;
  const dangerous = (current && isDangerous(current.condition)) || hasUrgent(data.alerts);
  // Anything that must stay fully visible (alerts, safety lines, long text) goes below the map, not over it.
  const placement: Placement =
    data.alerts === null || data.alerts.length > 0 || dangerous || (current?.text.length ?? 0) > LONG_TEXT || (runDay?.shortForecast.length ?? 0) > 44
      ? "stack"
      : "float";
  const tight = floating && placement === "float";

  return (
    <Frame now={now} state="ok" floating={floating} placement={placement}>
      <div className="mt-3 flex items-center gap-4">
        <WeatherArt condition={current?.condition ?? "cloudy"} season={season} isDay={current?.isDay} windy={current?.windy} className={tight ? "size-12" : "size-16"} />
        <div className="min-w-0">
          <p className={tight ? "text-[28px] leading-none font-black tracking-[-0.04em]" : "text-[32px] leading-none font-black tracking-[-0.04em]"}>
            {obs?.tempF != null ? degrees(obs.tempF) : "–"}
            <span className="sr-only"> degrees Fahrenheit</span>
          </p>
          <p className="mt-1 text-p font-semibold">{current ? current.text : "Conditions unavailable"}</p>
        </div>
      </div>
      <p className="mt-2 text-p-sm">
        {obs ? (
          <>
            Feels like {degrees(obs.feelsLikeF)} · Wind {windText(obs)}
          </>
        ) : (
          "No current station reading."
        )}
      </p>
      <p className="mt-1 text-[12px] leading-[18px] text-foreground/75">
        {obs ? `Observed ${formatClock(obs.at)}. ` : ""}
        {current?.source === "forecast" ? "Description from today’s forecast. " : ""}
        Source: National Weather Service.
      </p>
      {runDay && (
        <p data-slot="run-day-forecast" className="mt-2 border-t border-foreground/15 pt-2 text-p-sm">
          <span className="font-semibold">Forecast for {formatShortDate(runDay.date)}:</span> {runDay.shortForecast}, high{" "}
          {degrees(runDay.highF)}, low {degrees(runDay.lowF)}. Forecasts change.
        </p>
      )}
      <Alerts alerts={data.alerts} dangerous={!!dangerous} />
    </Frame>
  );
}
