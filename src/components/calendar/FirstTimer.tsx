import { Container } from "@/components/Container";
import { FLUID_TYPE } from "@/lib/fluid";
import { DISPLAY_HEADING, standardH2 } from "@/lib/headings";
import { onDarkSurface } from "@/lib/surfaces";
import { cn } from "@/lib/utils";

/**
 * "New here? Good." Compact black section. Says only what the club has
 * confirmed in its run copy: every pace, self-directed effort, no registration,
 * and join for as long as you like.
 */
const POINTS = [
  ["All paces", "Run, jog, hike, or mix it up."],
  ["Your own effort", "Climb at a pace that works for you. Nobody is keeping score."],
  ["No registration", "Show up. There is nothing to sign up for."],
  ["Stay as long as you like", "A few laps or the whole session, with breaks whenever you need them."],
] as const;

export function FirstTimer({ className }: { className?: string }) {
  return (
    <section aria-labelledby="first-timer-heading" className={cn("bg-primary py-16 text-primary-foreground md:py-20", onDarkSurface, className)}>
      <Container className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <h2 id="first-timer-heading" style={standardH2()} className={cn(FLUID_TYPE, DISPLAY_HEADING)}>
          New here? Good<span className="ss08">.</span>
        </h2>
        <ul className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
          {POINTS.map(([title, text]) => (
            <li key={title} className="border-t border-primary-foreground pt-4">
              <p className="text-[18px] leading-[27px] font-semibold">{title}</p>
              <p className="mt-1 text-p text-primary-foreground/75">{text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
