"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { HillProfile } from "@/components/HillProfile";
import { ArrowUpRightIcon } from "@/components/icons";
import { FLUID_TYPE, fluidType } from "@/lib/fluid";
import type { Hill } from "@/lib/hills";
import { cn } from "@/lib/utils";

/**
 * The interactive half of "Get high in the city." (homepage Round 2): the
 * hill list and the terrain profile it drives.
 *
 *   default      Cricket Hill's profile (Owner direction, 2026-11-11)
 *   hover        a row (mouse or pen) previews that hill's profile
 *   focus        keyboard focus on a row's link previews it the same way
 *   click / tap  a row navigates to the hill's page (whole-row link)
 *   touch        hover doesn't exist, so a row of "preview" toggle buttons sits
 *                under the profile on coarse-pointer tablets (not on phones,
 *                where the rows alone carry the list); rows still navigate on tap
 *
 * The previewed hill stays until another is chosen (no flicker as the pointer
 * crosses the gaps between rows). All five drawings are rendered stacked in one
 * grid cell, loaded together, so switching is instant and nothing shifts; the
 * swap is a 200ms cross-fade, or instant under reduced motion. Hidden profiles
 * are `inert` and aria-hidden, so assistive tech reads only the shown one.
 */
export function HillsExplorer({
  hills,
  defaultSlug,
  intro,
}: {
  hills: Hill[];
  defaultSlug: string;
  intro: ReactNode;
}) {
  const withProfile = hills.filter((h) => h.profile);
  const initial = withProfile.find((h) => h.slug === defaultSlug)?.slug ?? withProfile[0]?.slug;
  const [active, setActive] = useState(initial);

  return (
    <>
      <div className="grid md:grid-cols-2 md:gap-x-(--hills-gap-x-b)">
        {intro}

        {withProfile.length > 0 && (
          <div className="mt-(--hills-fig-mt-a) self-start md:mt-(--hills-fig-mt-b)">
            <div className="grid" data-slot="hill-profiles">
              {withProfile.map((h) => {
                const shown = h.slug === active;
                return (
                  <div
                    key={h.slug}
                    data-hill={h.slug}
                    data-active={shown || undefined}
                    aria-hidden={!shown}
                    inert={!shown}
                    className={cn(
                      "col-start-1 row-start-1",
                      "motion-safe:transition-[opacity,visibility] motion-safe:duration-200",
                      shown ? "visible opacity-100" : "invisible opacity-0",
                    )}
                  >
                    <HillProfile name={h.name} profile={h.profile!} />
                  </div>
                );
              })}
            </div>

            {withProfile.length > 1 && (
              <div
                role="group"
                aria-label="Preview a hill profile"
                className="mt-4 hidden flex-wrap gap-2 md:pointer-coarse:flex"
              >
                {withProfile.map((h) => (
                  <button
                    key={h.slug}
                    type="button"
                    aria-pressed={h.slug === active}
                    onClick={() => setActive(h.slug)}
                    className={cn(
                      "min-h-9 rounded-full border border-foreground px-3 text-p-sm font-medium outline-none",
                      "focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2",
                      "aria-pressed:bg-foreground aria-pressed:text-background",
                    )}
                  >
                    {h.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {hills.length > 0 && (
        <ol className="mt-(--hills-list-mt-a) border-b border-foreground md:mt-(--hills-list-mt-b)">
          {hills.map((hill) => (
            <HillRow
              key={hill.slug}
              hill={hill}
              active={hill.slug === active}
              onPreview={hill.profile ? () => setActive(hill.slug) : undefined}
            />
          ))}
        </ol>
      )}
    </>
  );
}

function HillRow({
  hill,
  active,
  onPreview,
}: {
  hill: Hill;
  active: boolean;
  onPreview?: () => void;
}) {
  const name = fluidType([28, 32, 64], [36, 36, 60.8]);

  return (
    <li
      data-active={active || undefined}
      onPointerEnter={(e) => {
        if (e.pointerType !== "touch") onPreview?.();
      }}
      className={cn(
        "group/hill relative border-t border-foreground",
        "motion-safe:transition-colors motion-safe:duration-150 hover:bg-border data-active:bg-border",
        // mobile: name/place stacked; 100 tall incl. the 1px rule
        "pt-[13px] pb-[22px]",
        // tablet: 96 tall incl. the rule
        "md:pb-[18px]",
        // desktop: one line, place right, ↗
        "lg:flex lg:items-center lg:gap-8 lg:py-6",
      )}
    >
      <h3 style={name} className={cn(FLUID_TYPE, "min-w-0 font-semibold tracking-[-0.03em] lg:flex-1")}>
        <Link
          href={`/hills/${hill.slug}`}
          onFocus={onPreview}
          className={cn(
            "outline-none underline-offset-[0.12em] decoration-[0.04em] group-hover/hill:underline",
            "after:absolute after:inset-0 after:content-['']",
            "focus-visible:after:ring-3 focus-visible:after:ring-ring",
          )}
        >
          {hill.name}
        </Link>
      </h3>
      <p className="mt-2 text-[13px] leading-5 lg:mt-0 lg:shrink-0 lg:text-p lg:leading-6">{hill.neighborhood}</p>
      <ArrowUpRightIcon
        className={cn(
          "hidden size-5 shrink-0 lg:block",
          "motion-safe:transition-transform motion-safe:duration-150 motion-safe:group-hover/hill:translate-x-0.5 motion-safe:group-hover/hill:-translate-y-0.5",
        )}
      />
    </li>
  );
}
