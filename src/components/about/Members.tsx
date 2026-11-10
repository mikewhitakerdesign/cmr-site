import Image from "next/image";
import { ArrowLink } from "@/components/ArrowLink";
import { Container } from "@/components/Container";
import { UserIcon } from "@/components/icons";
import { FLUID_TYPE, fluidType, fluidVars } from "@/lib/fluid";
import { DISPLAY_HEADING, displayHeading } from "@/lib/headings";
import { cn } from "@/lib/utils";

/** Same circle for both profiles: equal size, no stroke, the site's subtle map-image shadow. */
const circle =
  "relative flex aspect-square w-full max-w-[240px] items-center justify-center overflow-hidden rounded-full shadow-[0_8px_14px_rgba(65,65,65,0.28)]";

/**
 * "Members" — two matching profiles in a two-column grid (side by side at every
 * width, never overlapping): the founder, with the Mohican 100 photograph, and
 * an invitation (light-gray circle, darker-gray person) that links to /join.
 * Static content; there is no membership backend.
 */
export function Members() {
  const layout = fluidVars({ "--members-py": [56, 72, 112] });
  const name = fluidType([16, 18, 20], [24, 26, 28]);
  const meta = fluidType([14, 16, 16], [20, 24, 24]);

  return (
    <section
      aria-labelledby="members-heading"
      style={layout}
      className="bg-background text-foreground py-(--members-py-a) md:py-(--members-py-b)"
    >
      <Container>
        <h2 id="members-heading" style={displayHeading()} className={cn(FLUID_TYPE, DISPLAY_HEADING, "ss08")}>
          Members
        </h2>
        <div className="mt-10 grid max-w-[560px] grid-cols-2 items-start gap-x-6 gap-y-8 md:mt-14 md:gap-x-12">
          <div>
            <div className={circle}>
              <Image
                src="/about/founder-ultra.jpg"
                alt="Michael Whitaker at a night ultramarathon aid station, smiling and holding a decorated storage bin that reads “We love you”."
                fill
                sizes="(min-width: 768px) 240px, 40vw"
                className="object-cover object-[50%_22%]"
              />
            </div>
            <p style={name} className={cn(FLUID_TYPE, "mt-5 font-bold")}>
              Michael Whitaker
            </p>
            <p style={meta} className={cn(FLUID_TYPE, "text-foreground/70")}>
              Founder &amp; Director
            </p>
          </div>
          <div>
            <div className={cn(circle, "bg-border text-muted-foreground")}>
              <UserIcon aria-hidden className="size-1/2" strokeWidth={1} />
            </div>
            <p style={name} className={cn(FLUID_TYPE, "mt-5 font-bold")}>
              Are you the next member?
            </p>
            <ArrowLink href="/join" className="mt-2 text-p">
              Join the club
            </ArrowLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
