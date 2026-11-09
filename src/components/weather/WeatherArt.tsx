import { seasonVars } from "@/lib/weather/season";
import type { Condition, Season } from "@/lib/weather/types";
import { WeatherGlyph } from "@/components/weather/WeatherGlyph";
import { cn } from "@/lib/utils";

/**
 * The small seasonal illustration: a pale tie-dye disc (the homepage circles'
 * fill, tinted by season) with the condition's glyph on top. Season picks the
 * fill, condition picks the glyph. Decorative.
 */
export function WeatherArt({
  condition,
  season,
  isDay = true,
  windy = false,
  animate = true,
  className,
}: {
  condition: Condition;
  season: Season;
  isDay?: boolean;
  windy?: boolean;
  animate?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      data-slot="weather-art"
      data-season={season}
      style={seasonVars(season)}
      className={cn("relative isolate shrink-0 overflow-hidden rounded-full bg-(--tie-wash) text-black", className)}
    >
      <div className="cmr-tie-dye absolute -z-10" />
      <WeatherGlyph condition={condition} isDay={isDay} windy={windy} animate={animate} className="p-[14%]" />
    </div>
  );
}
