import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { Container } from "@/components/Container";
import { ContourField } from "@/components/ContourField";
import { CtaLink } from "@/components/CtaLink";
import { RunActions } from "@/components/calendar/RunActions";
import { statusLabel } from "@/components/calendar/status";
import { TopoPattern } from "@/components/home/TopoPattern";
import { ClockIcon, MapPinIcon } from "@/components/icons";
import { WeatherCompact } from "@/components/weather/WeatherCompact";
import { WeatherGuidance } from "@/components/weather/WeatherGuidance";
import { FLUID_TYPE, fluidType } from "@/lib/fluid";
import { BODY_TEXT_COLOR, DISPLAY_HEADING, displayHeading } from "@/lib/headings";
import { hillsWithPages } from "@/lib/hills";
import { getRun, listedRuns, nextWithStatus, type Run } from "@/lib/runs";
import { describeSchedule, formatLongDate, formatTime, toDateTimeAttr } from "@/lib/schedule";
import { onDarkSurface } from "@/lib/surfaces";
import { cn } from "@/lib/utils";

// The next occurrence and the weather depend on now; the weather fetch is cached by the fetch layer.
export const dynamic = "force-dynamic";

export const generateStaticParams = () => listedRuns().map((run) => ({ slug: run.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const run = getRun((await params).slug);
  if (!run || run.status === "placeholder") return {};
  return { title: `${run.title} | Chicago Mountain Runners`, description: run.content?.headline ?? run.description };
}

const LABEL = "font-mono text-[13px] leading-5 tracking-[0.1em] uppercase";

/**
 * Run detail template, shared by every run (Figma Run Details 1:4191 / 1:4604 /
 * 1:5008). The Hill Beta section of the Figma frame is removed on purpose: no
 * hill profile appears here, only a link to the hill's page.
 */
export default async function RunPage({ params }: { params: Promise<{ slug: string }> }) {
  const run = getRun((await params).slug);
  // The scaffold placeholder is not a real run and has no detail page.
  if (!run || run.status === "placeholder" || !run.content) notFound();
  const c = run.content;
  const now = new Date();
  const next = nextWithStatus(run, now);
  const nextReal = next ? (next.occurrence.status === "cancelled" ? next.following : next.occurrence) : null;
  const hill = hillsWithPages().find((h) => h.slug === run.hillSlug);
  const heading = fluidType([46, 84, 124], [44, 80, 112]);
  const isWeekly = run.schedule.kind === "weekly";

  return (
    <>
      <section aria-labelledby="run-heading" className="relative isolate overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-50">
          <ContourField className="bg-background text-(--cmr-contour-on-light)" scale={460} levels={10} seed={7} fallback={<TopoPattern />} />
        </div>
        <Container className="pt-10 pb-14 md:pt-14 md:pb-20">
          <nav aria-label="Breadcrumb">
            <ol className={cn(LABEL, "flex flex-wrap gap-x-2 text-foreground/75")}>
              <li>
                <Link href="/calendar" className="rounded-xs text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring">
                  Find a Run
                </Link>
                <span aria-hidden> /</span>
              </li>
              <li aria-current="page">{run.title}</li>
            </ol>
          </nav>

          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-14">
            <div>
              <h1 id="run-heading" style={heading} className={cn(FLUID_TYPE, "font-black tracking-[-0.045em] text-balance uppercase")}>
                {run.title}
              </h1>
              <p className="mt-6 text-[24px] leading-[1.2] font-semibold tracking-[-0.5px] md:text-[32px]">{c.headline}</p>
              <div className={cn("mt-5 flex max-w-[620px] flex-col gap-4 text-[18px] leading-[27px]", BODY_TEXT_COLOR)}>
                {c.intro.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              <div className="mt-8">
                <RunActions
                  slug={run.slug}
                  title={run.title}
                  nextDate={nextReal?.date ?? null}
                  recurring={isWeekly}
                  directionsUrl={run.directionsUrl}
                />
              </div>
            </div>

            <NextCard run={run} next={next} now={now} />
          </div>
        </Container>
      </section>

      <AtAGlance run={run} hillName={hill?.name ?? c.placeName} hillHref={hill ? `/hills/${hill.slug}` : undefined} surface={hill?.page.surfaceSummary} />
      <WhatToExpect run={run} />

      <section aria-labelledby="meet-heading" className="border-t border-foreground/15 py-16 md:py-24">
        <Container className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 id="meet-heading" style={displayHeading()} className={cn(FLUID_TYPE, DISPLAY_HEADING)}>
              Where to meet<span className="ss08">.</span>
            </h2>
            <p className="mt-6 flex items-start gap-2 text-[20px] leading-[30px] font-semibold">
              <MapPinIcon className="mt-1.5 size-4 shrink-0" />
              {next?.occurrence.status === "changed-location" ? next.occurrence.meetupLocation : run.meetupLocation}
            </p>
            <p className={cn("mt-3 max-w-[48ch] text-[18px] leading-[27px]", BODY_TEXT_COLOR)}>
              The exact spot may vary. Use the link for the park and check for schedule updates before you go.
            </p>
            {run.directionsUrl && (
              <CtaLink href={run.directionsUrl} target="_blank" rel="noopener noreferrer" variant="primary" className="mt-6 h-12 px-6 text-[16px] font-medium">
                Get directions<span className="sr-only"> (opens Google Maps in a new tab)</span>
              </CtaLink>
            )}
          </div>
          <WeatherCompact now={now} runDate={nextReal?.date} />
        </Container>
      </section>

      <WeatherGuidance className="border-t border-foreground/15" />

      <section aria-labelledby="first-heading" className={cn("bg-primary py-16 text-primary-foreground md:py-20", onDarkSurface)}>
        <Container className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <h2 id="first-heading" style={fluidType([44, 56, 72], [44, 56, 68])} className={cn(FLUID_TYPE, DISPLAY_HEADING)}>
            First time<span className="ss08">?</span>
          </h2>
          <div>
            <p className="max-w-[56ch] text-[20px] leading-[30px]">{c.firstTime}</p>
            <CtaLink href="/calendar" variant="secondary" className="mt-8 h-14 px-7 text-[18px] leading-[27px] font-medium">
              Back to the calendar
            </CtaLink>
          </div>
        </Container>
      </section>
    </>
  );
}

/** The "when" block: the next real date, the cadence, duration, place and the no-registration line. */
function NextCard({ run, next, now }: { run: Run; next: ReturnType<typeof nextWithStatus>; now: Date }) {
  const o = next?.occurrence;
  const label = o ? statusLabel(o.status, o.changedBoth) : null;
  const cancelled = o?.status === "cancelled";
  const real = o ? (cancelled ? next?.following : o) : null;
  return (
    <aside
      aria-labelledby="next-heading"
      data-slot="next-card"
      data-occurrence-status={o?.status ?? "none"}
      className={cn("self-start rounded-lg bg-primary p-6 text-primary-foreground md:p-8", onDarkSurface)}
    >
      <h2 id="next-heading" className={LABEL}>
        Next run
      </h2>
      {o ? (
        <>
          <p className={cn("mt-4 text-[32px] leading-[1.05] font-black tracking-[-0.04em] md:text-[40px]", cancelled && "line-through decoration-2")}>
            <time dateTime={toDateTimeAttr(o)}>
              {formatLongDate(o.date)}
              <span className="block">{formatTime(o.time)}</span>
            </time>
          </p>
          {label && (
            <p data-slot="status" className="mt-3 inline-block border border-primary-foreground px-2 py-0.5 font-mono text-[12px] leading-5 tracking-[0.08em] uppercase">
              {label}
            </p>
          )}
          {o.note && <p className="mt-3 text-p-sm">{o.note}</p>}
          {cancelled && (
            <p className="mt-3 text-p">
              {real ? `Next run: ${formatLongDate(real.date)} · ${formatTime(real.time)}.` : "No later run is scheduled yet."}
            </p>
          )}
        </>
      ) : (
        <p data-slot="no-upcoming" className="mt-4 text-[24px] leading-[1.15] font-semibold">
          No upcoming runs are scheduled right now. Check back soon.
        </p>
      )}
      <ul className="mt-6 grid gap-3 border-t border-primary-foreground/40 pt-5 text-p">
        <li className="flex items-start gap-2">
          <ClockIcon className="mt-1 size-4 shrink-0" />
          <span>
            <span className="sr-only">Schedule: </span>
            {describeSchedule(run.schedule)}
            {run.durationLabel && <span className="text-primary-foreground/75"> · {run.durationLabel}</span>}
          </span>
        </li>
        <li className="flex items-start gap-2">
          <MapPinIcon className="mt-1 size-4 shrink-0" />
          <span>
            <span className="sr-only">Meeting place: </span>
            {o?.meetupLocation ?? run.meetupLocation}
          </span>
        </li>
      </ul>
      <p className="mt-5 text-p font-semibold">No registration. Just show up.</p>
      {run.status !== "verified" && (
        <p data-slot="provisional" className="mt-3 text-p-sm text-primary-foreground/75">
          Schedule details are not yet confirmed. Check back for updates.
        </p>
      )}
      <span hidden data-now={now.toISOString()} />
    </aside>
  );
}

function AtAGlance({ run, hillName, hillHref, surface }: { run: Run; hillName: string; hillHref?: string; surface?: string }) {
  const items: [string, React.ReactNode][] = [
    ["Duration", run.durationLabel ?? "To be confirmed"],
    ["Workout", run.workoutSummary ?? "To be confirmed"],
    ["Surface", surface ?? "To be confirmed"],
    ["Hill", hillHref ? <Link key="h" href={hillHref} className="underline-offset-4 hover:underline">{hillName}</Link> : hillName],
  ];
  return (
    <section aria-label="At a glance" className="border-y border-foreground">
      <Container>
        <dl className="grid grid-cols-2 gap-y-6 py-8 md:grid-cols-4">
          {items.map(([k, v]) => (
            <div key={k}>
              <dt className={cn(LABEL, "text-foreground/75")}>{k}</dt>
              <dd className="mt-1 text-[20px] leading-[28px] font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}

function WhatToExpect({ run }: { run: Run }) {
  const c = run.content!;
  const rows: [string, string][] = [
    ["Workout", c.workout],
    ["Effort", c.effort],
    ["Terrain", c.terrain],
    ["What to bring", c.bring],
  ];
  return (
    <section aria-labelledby="expect-heading" className="py-16 md:py-24">
      <Container>
        <h2 id="expect-heading" style={displayHeading()} className={cn(FLUID_TYPE, DISPLAY_HEADING)}>
          What to expect<span className="ss08">.</span>
        </h2>
        <dl className="mt-10 border-b border-foreground md:mt-14">
          {rows.map(([k, v]) => (
            <Fragment key={k}>
              <div className="grid gap-2 border-t border-foreground py-6 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10 md:py-8">
                <dt className={cn(LABEL, "pt-1")}>{k}</dt>
                <dd className="max-w-[68ch] text-[18px] leading-[27px]">{v}</dd>
              </div>
            </Fragment>
          ))}
        </dl>
      </Container>
    </section>
  );
}
