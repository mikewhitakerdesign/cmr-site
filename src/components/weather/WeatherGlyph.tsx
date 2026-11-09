import type { SVGProps } from "react";
import type { Condition } from "@/lib/weather/types";
import { cn } from "@/lib/utils";

/**
 * One weather glyph for every condition: black line drawing on a 64 grid, white
 * cloud fills, no brand colors (the season supplies those behind it). With
 * `animate`, small parts drift, fall or turn (classes in src/styles/cmr.css,
 * all inside `prefers-reduced-motion: no-preference`). Decorative: callers
 * label the condition in text.
 */
const CLOUD = "M17 47h28a10 10 0 0 0 1.6-19.9A13.5 13.5 0 0 0 21 29.6 9 9 0 0 0 17 47z";

function Cloud({ className, transform }: { className?: string; transform?: string }) {
  return <path className={className} transform={transform} d={CLOUD} fill="#fff" />;
}

const Rays = ({ cx, cy, r1, r2, className }: { cx: number; cy: number; r1: number; r2: number; className?: string }) => (
  <g className={className} style={{ transformOrigin: `${cx}px ${cy}px` }}>
    {Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4;
      const f = (r: number) => [(cx + r * Math.cos(a)).toFixed(1), (cy + r * Math.sin(a)).toFixed(1)];
      const [x1, y1] = f(r1);
      const [x2, y2] = f(r2);
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
    })}
  </g>
);

const delay = (i: number) => ({ animationDelay: `${i * 0.45}s` });

export function WeatherGlyph({
  condition,
  isDay = true,
  windy = false,
  animate = false,
  className,
  ...props
}: { condition: Condition; isDay?: boolean; windy?: boolean; animate?: boolean } & SVGProps<SVGSVGElement>) {
  const a = (cls: string) => (animate ? cls : undefined);
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      data-condition={condition}
      className={cn("size-full", className)}
      {...props}
    >
      {condition === "clear" &&
        (isDay ? (
          <>
            <circle cx={32} cy={32} r={9} fill="#fff" />
            <Rays cx={32} cy={32} r1={14.5} r2={19.5} className={a("wx-rays")} />
          </>
        ) : (
          <path d="M42 41a14 14 0 1 1-13-25 11 11 0 0 0 13 25z" fill="#fff" />
        ))}

      {condition === "partly-cloudy" && (
        <>
          {isDay ? (
            <>
              <circle cx={25} cy={24} r={7.5} fill="#fff" />
              <Rays cx={25} cy={24} r1={12} r2={16} className={a("wx-rays")} />
            </>
          ) : (
            <path d="M32 27a10 10 0 1 1-9-18 8 8 0 0 0 9 18z" fill="#fff" />
          )}
          <Cloud transform="translate(5 4)" className={a("wx-drift")} />
        </>
      )}

      {condition === "cloudy" && (
        <>
          <Cloud transform="translate(14 -9) scale(.72)" className={a("wx-drift-slow")} />
          <Cloud transform="translate(0 2)" className={a("wx-drift")} />
        </>
      )}

      {condition === "fog" && (
        <>
          <Cloud transform="translate(2 -8) scale(.88)" className={a("wx-drift")} />
          <g className={a("wx-gust")}>
            <line x1={14} y1={44} x2={50} y2={44} />
            <line x1={20} y1={51} x2={56} y2={51} />
          </g>
          <line x1={14} y1={58} x2={42} y2={58} />
        </>
      )}

      {condition === "rain" && (
        <>
          <Cloud transform="translate(0 -9)" className={a("wx-drift")} />
          {[0, 1, 2].map((i) => (
            <line key={i} x1={24 + i * 9} y1={44} x2={22 + i * 9} y2={51} className={a("wx-fall")} style={delay(i)} />
          ))}
        </>
      )}

      {condition === "thunder" && (
        <>
          <Cloud transform="translate(0 -9)" className={a("wx-drift")} />
          <path d="M34 39l-7 11h6l-3 9 10-13h-6l4-7z" fill="currentColor" />
        </>
      )}

      {condition === "snow" && (
        <>
          <Cloud transform="translate(0 -9)" className={a("wx-drift")} />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={24 + i * 9} cy={47} r={1.6} fill="currentColor" className={a("wx-sway")} style={delay(i)} />
          ))}
        </>
      )}

      {condition === "mix" && (
        <>
          <Cloud transform="translate(0 -9)" className={a("wx-drift")} />
          <line x1={24} y1={44} x2={22} y2={51} className={a("wx-fall")} />
          <circle cx={33} cy={47} r={1.6} fill="currentColor" className={a("wx-sway")} style={delay(1)} />
          <line x1={42} y1={44} x2={40} y2={51} className={a("wx-fall")} style={delay(2)} />
        </>
      )}

      {windy && (
        <g className={a("wx-gust")}>
          <path d="M8 14h24a4 4 0 1 0-4-4" />
          <path d="M12 20h30a4 4 0 1 1-4 4" />
        </g>
      )}
    </svg>
  );
}
