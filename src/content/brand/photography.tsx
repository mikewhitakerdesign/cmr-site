import Image from "next/image";
import type { ReactNode } from "react";
import { GradientLab } from "@/components/brand/demos/GradientLab";
import { Figure, Rule, SpecList, SpecTable } from "@/components/brand/kit";
import { LABEL, PRINT_BOTTOM, PRINT_FILL, PRINT_FILL_COL, PRINT_GROW, PRINT_ONLY, PRINT_ROWS_1, WEB_ONLY } from "@/components/brand/styles";
import type { BrandChapter } from "@/lib/brand/manual";
import { MESH_OPACITY } from "@/lib/brand/spec";
import { cn } from "@/lib/utils";

const HERO = "/home/hero.jpg";

function Photo({ src, position = "50% 72%", gradient = 0, shade = 0, className, children, sizes = "(min-width: 1024px) 600px, 100vw" }: { src: string; position?: string; gradient?: number; shade?: number; className?: string; children?: ReactNode; sizes?: string }) {
  return (
    <div className={cn("relative isolate overflow-hidden rounded-xl bg-primary text-primary-foreground", className)}>
      <Image src={src} alt="" fill sizes={sizes} className="-z-10 object-cover" style={{ objectPosition: position }} />
      {gradient > 0 && <div aria-hidden style={{ opacity: gradient / 100 }} className="absolute inset-0 -z-10 bg-[url(/home/mesh-gradient.png)] bg-[length:100%_100%]" />}
      {shade > 0 && <div aria-hidden style={{ opacity: shade / 100 }} className="absolute inset-0 -z-10 bg-primary" />}
      {children}
    </div>
  );
}

function LibraryCard({ title, rights, rows, children }: { title: string; rights: string; rows: [string, string][]; children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-col">
      <div className={cn("relative aspect-[4/3]", PRINT_FILL)}>{children}</div>
      <p className="mt-4 text-[20px] leading-6 font-black tracking-[-0.02em]">{title}</p>
      <SpecList className="mt-3" rows={[...rows, ["Rights", rights]]} />
    </div>
  );
}

/** The hero at one breakpoint: the frame's real proportion and the crop the site uses there. */
function Crop({ label, w, h, position, note }: { label: string; w: number; h: number; position: string; note: string }) {
  return (
    <figure style={{ flex: `${w / h} 1 0%` }} className="min-w-0">
      <Photo src={HERO} position={position} gradient={MESH_OPACITY.hero} className="w-full rounded-lg" sizes="(min-width: 640px) 520px, 100vw">
        <div style={{ aspectRatio: `${w} / ${h}` }} className="flex items-start justify-center pt-[9%]">
          <p className="text-center leading-[1.02] font-black" style={{ fontSize: `clamp(10px, ${(w / h) * 2.1}cqw, 40px)` }}>
            MAKE YOUR
            <br />
            OWN MTNS
          </p>
        </div>
      </Photo>
      <figcaption className="mt-3">
        <span className={cn(LABEL, "block text-[11px] text-foreground/65")}>
          {label} · {w} × {h}
        </span>
        <span className="mt-1 block text-[13px] leading-[18px] text-foreground/75">{note}</span>
      </figcaption>
    </figure>
  );
}

export const photography: BrandChapter = {
  slug: "photography",
  number: "06",
  title: "Photography.",
  name: "Photography",
  summary: "Real places, real weather, real people. How CMR chooses, crops and treats photographs, and what it must be able to stand behind in each one.",
  plates: [
    {
      id: "library",
      title: "Three photographs.",
      nav: "The library",
      lede: "That is the whole library today. A small set is not a weakness: it is why the site looks like one place and not a stock catalog.",
      render: () => (
        <>
          <div className={cn("grid gap-x-6 gap-y-10 md:grid-cols-3", PRINT_GROW, PRINT_ROWS_1)}>
            <LibraryCard
              title="The crest."
              rights="The Owner's photograph. Cleared."
              rows={[
                ["Subject", "A lone runner on the crest of Cricket Hill"],
                ["Used", "Homepage hero"],
                ["File", "1920 × 1900 px"],
              ]}
            >
              <Photo src={HERO} position="50% 74%" className="size-full" />
            </LibraryCard>
            <LibraryCard
              title="The tree line."
              rights="Not yet on record. Website only."
              rows={[
                ["Subject", "Trees and long shadows on the grass"],
                ["Used", "“Just show up.” on three pages"],
                ["File", "2880 × 2163 px"],
              ]}
            >
              <Photo src="/home/just-show-up.jpg" position="50% 20%" className="size-full" />
            </LibraryCard>
            <LibraryCard
              title="The path."
              rights="Cleared for its use on About."
              rows={[
                ["Subject", "Two runners in a frosty field at sunrise, Cricket Hill behind"],
                ["Used", "About page card, black and white"],
                ["File", "2254 × 1301 px"],
              ]}
            >
              <div className="flex size-full items-center justify-center rounded-xl border border-dashed border-foreground/50 p-6 text-center">
                <p className="max-w-[28ch] text-p-sm text-foreground/70">
                  Not reproduced here. It shows recognizable people and is cleared for the About page; any other use is asked for first.
                </p>
              </div>
            </LibraryCard>
          </div>
        </>
      ),
    },
    {
      id: "subject",
      title: "Real places, real people.",
      nav: "Subject",
      lede: "The library so far is landscapes, but the approach covers whatever comes next: group runs, details, apparel. Photograph what actually happened, where it happened, in the weather it happened in. Nobody performs athleticism for the camera.",
      render: () => (
        <div className={cn("grid gap-8 lg:grid-cols-12", PRINT_GROW)}>
          <Figure className={cn("lg:col-span-7", PRINT_FILL_COL)} caption="The homepage photograph, with no headline over it. The place is the subject; the runner is a speck on the crest.">
            <Photo src={HERO} position="50% 74%" className={cn("aspect-[4/3]", PRINT_FILL)} sizes="(min-width: 1024px) 760px, 100vw" />
          </Figure>
          <div className="flex flex-col lg:col-span-5">
            <div className="grid gap-5">
              <Rule title="Places.">Wide frames and real terrain. A hill should look as big as framing can make it, never bigger than retouching would.</Rule>
              <Rule title="People.">Group runs, the walk back down, friends mid-laugh after a repeat. Candid over posed; recognizable people only with their agreement.</Rule>
              <Rule title="Details and things.">Shoes on frost, a watch at the summit, a shirt on a real person on a real hill. Apparel is shown being worn, where it was worn.</Rule>
              <Rule title="Chicago, in any weather.">Lakefront grass, bare trees, fog, flat gray light, snow. If the picture could be Colorado, it is the wrong picture.</Rule>
            </div>
            <SpecTable
              className={PRINT_BOTTOM}
              caption="Photography to avoid"
              head={["Not CMR", "Why"]}
              rows={[
                ["Stock mountains and ridgelines", "The joke only works if the hills are ours."],
                ["Staged activity", "Never imply a run, a crowd or an event that did not happen."],
                ["Podium heroics", "The club is about showing up, not winning."],
              ]}
            />
          </div>
        </div>
      ),
    },
    {
      id: "treatment",
      title: "Grade and wash.",
      nav: "Treatment",
      lede: "A landscape gets three things done to it, in this order: a crop, a light grade toward richer color, and the mesh gradient laid over the top. Nothing is retouched, stretched or generated.",
      render: () => (
        <>
          <div className={WEB_ONLY}>
            <GradientLab />
          </div>
          <div className={cn("grid-cols-3 gap-4", PRINT_ONLY, "[.brand-print_&]:grid", PRINT_GROW, PRINT_ROWS_1)}>
            <Figure className={PRINT_FILL_COL} caption="Cropped and graded. No gradient.">
              <Photo src={HERO} className={PRINT_FILL} />
            </Figure>
            <Figure className={PRINT_FILL_COL} caption={`Gradient at ${MESH_OPACITY.hero}%: the homepage hero.`}>
              <Photo src={HERO} gradient={MESH_OPACITY.hero} className={PRINT_FILL} />
            </Figure>
            <Figure className={PRINT_FILL_COL} caption={`Gradient at ${MESH_OPACITY.justShowUp}%: the stronger treatment, used on “Just show up.”`}>
              <Photo src={HERO} gradient={MESH_OPACITY.justShowUp} className={PRINT_FILL} />
            </Figure>
          </div>
          <div className="mt-8 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <SpecList
                rows={[
                  ["1. Crop", "At the photograph's real proportions. Never stretched."],
                  ["2. Grade", "A little more saturation and contrast"],
                  ["3. Gradient", `${MESH_OPACITY.hero}% or ${MESH_OPACITY.justShowUp}%`],
                  ["4. Shade, if type needs it", "Black, evenly over the whole picture"],
                ]}
              />
            </div>
            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:col-span-6">
              <Rule title="Crop, never distort.">An early design stretched the hill to look steeper. The site uses the real proportions: the hill is as gentle as it really is.</Rule>
              <Rule title="No wash over faces.">The gradient is for landscapes. Photographs of people stay natural, or go black and white, as the About photograph does.</Rule>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "crops",
      title: "One photograph, three crops.",
      nav: "Crops",
      lede: "The hero is a single file. Each screen size shows a different window onto it, chosen so the crest of the hill, and the runner on it, stay in the lower part of the frame and clear of the headline.",
      render: () => (
        <>
          <div className={cn("@container flex flex-col gap-6 sm:flex-row sm:items-start", PRINT_GROW)}>
            <Crop label="Phone" w={393} h={614} position="50% 0%" note="Anchored to the top. The crest lands about 80% of the way down." />
            <Crop label="Tablet" w={768} h={670} position="50% 0%" note="Same anchor, wider window." />
            <Crop label="Desktop" w={1400} h={846} position="50% 77%" note="Shifted down so the crest sits about 72% of the way down." />
          </div>
          <div className={cn("mt-10 grid gap-x-8 gap-y-6 md:grid-cols-3", PRINT_BOTTOM)}>
            <Rule title="Plan for the headline.">Leave calm space (sky, grass, shadow) where type will sit, and keep the subject out of it. Check every screen size, not just the widest.</Rule>
            <Rule title="Keep the terrain whole.">Crop to the real proportions and never stretch or squeeze. Do not crop away the slope that makes the hill a hill.</Rule>
            <Rule title="Mind the resolution.">The hero is 1920 px wide: sharp on most screens, about 6.4 in at 300 dpi. For print, start from the original file.</Rule>
          </div>
        </>
      ),
    },
    {
      id: "type",
      title: "Type on photographs.",
      nav: "Type on photos",
      lede: "Display type goes straight onto the picture in solid white, with no shadow, glow or box. Where that costs contrast, fix the picture (a different crop, or an even shade over the whole photograph), not the type.",
      render: () => (
        <div className={cn("grid gap-8 lg:grid-cols-12", PRINT_GROW)}>
          <div className={cn("grid gap-4 lg:col-span-7", PRINT_ROWS_1)}>
            <Photo src={HERO} gradient={MESH_OPACITY.hero} className="flex min-h-[320px] flex-col justify-between p-6 md:p-8 [.brand-print_&]:min-h-0">
              <p className="text-center text-[clamp(40px,7vw,92px)] leading-[0.98] font-black">
                MAKE YOUR
                <br />
                OWN MTNS
              </p>
              <p className="flex flex-wrap gap-3">
                <span className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-p font-semibold text-primary-foreground">Find a Run</span>
                <span className="inline-flex h-11 items-center rounded-md bg-primary-foreground px-5 text-p font-semibold text-primary">Join the club</span>
              </p>
            </Photo>
          </div>
          <div className="flex flex-col lg:col-span-5">
            <div className="grid gap-6">
              <Rule title="Solid white, nothing added.">No text shadow, no halo, no translucent panel. If a line cannot be read, change the crop or shade the whole photograph evenly.</Rule>
              <Rule title="Buttons do not depend on the photo.">Every button on a photograph is a solid black or white fill with the opposite label: 21:1 whatever is behind it.</Rule>
              <Rule title="“Just show up.” meets AA.">A 38% shade and full-white copy: at least 4.8:1 for the copy and 4.4:1 for the heading, at every screen width measured.</Rule>
            </div>
            <Rule title="One exception: the homepage headline." className={PRINT_BOTTOM}>
              White over the palest sky falls below the 3:1 AA minimum for large text (1.4 to 1.9:1 at its worst point). The Owner has accepted it for the homepage hero; it is not claimed to conform, and new work does not repeat it.
            </Rule>
          </div>
        </div>
      ),
    },
    {
      id: "honesty",
      title: "Rights, and honesty.",
      nav: "Rights",
      lede: "A photograph is a claim: this place, these people, this happened. CMR's whole manner depends on not overstating things, so every image answers the same five questions before it is used.",
      render: () => (
        <div className={cn("grid gap-8 lg:grid-cols-12", PRINT_GROW)}>
          <ol className="lg:col-span-7">
            {(
              [
                ["Who took it, and may CMR use it here?", "The photographer's permission, for this use. Being on the website already is not permission for a poster or a shirt."],
                ["Is anyone recognizable?", "Then they have agreed to this use. Agreement to one use is not agreement to every use."],
                ["Is it where, and what, it says?", "Captions name the real place. A photograph of a hill is not evidence that CMR ran there, climbed it or counted it."],
                ["Does it imply something that did not happen?", "No staged group runs, no borrowed race photos, no crowd where there were two people."],
                ["Is it a photograph, and is it credited?", "Illustrations, maps and diagrams are labeled as what they are. Credit the photographer where it is due."],
              ] as const
            ).map(([q, a], i) => (
              <li key={q} className="grid grid-cols-[2rem_1fr] gap-x-4 border-t border-foreground py-4 [.brand-print_&]:py-3.5">
                <span className="font-mono text-[13px] leading-7 text-foreground/65">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="text-[20px] leading-[26px] font-black tracking-[-0.02em]">{q}</p>
                  <p className="mt-1 text-p-sm text-foreground/75">{a}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="flex flex-col gap-6 lg:col-span-5">
            <SpecTable
              caption="Image types on the CMR site and how each is credited"
              head={["Image type", "Credit or label"]}
              rows={[
                ["Photographs", "Photographer on file; captioned when people are shown."],
                ["Maps", "Static, grayscale, credited “© OpenStreetMap contributors” on the image."],
                ["Hill profiles", "“Shape and figures from USGS 3DEP elevation data, approximate.”"],
                ["Science figures", "Numbered and captioned as figures, with sources in the text."],
              ]}
            />
            <Rule title="No generated photographs.">Nothing presents generated imagery as a photograph.</Rule>
            <Rule title="The tree line stays where it is." className={PRINT_BOTTOM}>
              The photographer&apos;s permission for the “Just show up.” photograph is not on record, so it is used only where it is now, on the website.
            </Rule>
          </div>
        </div>
      ),
    },
  ],
};
