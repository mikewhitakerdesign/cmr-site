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
export function WeatherCompact({ now, runDate, minimal }: { now: Date; runDate?: IsoDate; minimal?: boolean }) {
  return (
    <Suspense fallback={<Frame now={now} state="loading" minimal={minimal} />}>
      <CompactData now={now} runDate={runDate} minimal={minimal} />
    </Suspense>
  );
}

async function CompactData({ now, runDate, minimal }: { now: Date; runDate?: IsoDate; minimal?: boolean }) {
  return <WeatherCompactView result={await getWeather(now)} now={now} runDate={runDate} minimal={minimal} />;
}

function Frame({ now, state, children, minimal }: { now: Date; state: "loading" | "unavailable" | "ok"; children?: React.ReactNode; minimal?: boolean }) {
  const today = toClubTime(now).date;
  const season = seasonOf(today);
  return (
    <section
      aria-labelledby="wx-compact-title"
      aria-busy={state === "loading" || undefined}
      data-weather={state}
      data-variant="compact"
      style={seasonVars(season)}
      data-minimal={minimal || undefined}
      className={
        minimal
          ? "border-t border-foreground/20 pt-5 text-foreground"
          : "relative isolate overflow-hidden rounded-lg border border-foreground/15 bg-(--tie-wash) p-5 text-foreground"
      }
    >
      {!minimal && <div aria-hidden className="cmr-tie-dye absolute -z-10 opacity-80" />}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <p id="wx-compact-title" className={LABEL}>
          Current weather
        </p>
        <p className="text-p-sm text-foreground/75">
          <time dateTime={today}>{todayLabel(today)}</time>
        </p>
      </div>
      {state === "loading" && (
        <p role="status" className="mt-4 text-p-sm text-foreground/75">
          Loading Chicago weather…
        </p>
      )}
      {state === "unavailable" && (
        <p className="mt-4 text-p-sm text-foreground/75">
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

export function WeatherCompactView({ result, now, runDate, minimal }: { result: WeatherResult; now: Date; runDate?: IsoDate; minimal?: boolean }) {
  if (result.status !== "ok") return <Frame now={now} state="unavailable" minimal={minimal} />;
  const { data } = result;
  const { observation: obs, current } = data;
  const season = seasonOf(toClubTime(now).date);
  const runDay = runDate ? data.days.find((d) => d.date === runDate) : undefined;
  const dangerous = (current && isDangerous(current.condition)) || hasUrgent(data.alerts);

  return (
    <Frame now={now} state="ok" minimal={minimal}>
      <div className="mt-4 flex items-center gap-4">
        <WeatherArt condition={current?.condition ?? "cloudy"} season={season} isDay={current?.isDay} windy={current?.windy} className={minimal ? "size-12" : "size-16"} />
        <div className="min-w-0">
          <p className={minimal ? "text-[24px] leading-none font-black tracking-[-0.04em]" : "text-[32px] leading-none font-black tracking-[-0.04em]"}>
            {obs?.tempF != null ? degrees(obs.tempF) : "–"}
            <span className="sr-only"> degrees Fahrenheit</span>
          </p>
          <p className="mt-1 text-p font-semibold">{current ? current.text : "Conditions unavailable"}</p>
        </div>
      </div>
      <p className="mt-3 text-p-sm">
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
        <p data-slot="run-day-forecast" className="mt-3 border-t border-foreground/15 pt-3 text-p-sm">
          <span className="font-semibold">Forecast for {formatShortDate(runDay.date)}:</span> {runDay.shortForecast}, high{" "}
          {degrees(runDay.highF)}, low {degrees(runDay.lowF)}. Forecasts change.
        </p>
      )}
      <Alerts alerts={data.alerts} dangerous={!!dangerous} />
    </Frame>
  );
}
