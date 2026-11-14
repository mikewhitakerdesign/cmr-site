import Image from "next/image";
import type { ReactNode } from "react";
import { GradientLab } from "@/components/brand/demos/GradientLab";
import { Figure, Pending, Rule, Source, SpecList, SpecTable, StatusTag } from "@/components/brand/kit";
import { LABEL, PRINT_BOTTOM, PRINT_FILL, PRINT_FILL_COL, PRINT_GROW, PRINT_ONLY, PRINT_ROWS_1, WEB_ONLY } from "@/components/brand/styles";
import type { BrandChapter, Status } from "@/lib/brand/manual";
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

function LibraryCard({ title, status, statusLabel, rows, children }: { title: string; status: Status; statusLabel: string; rows: [string, string][]; children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-col">
      <div className={cn("relative aspect-[4/3]", PRINT_FILL)}>{children}</div>
      <p className="mt-4 text-[20px] leading-6 font-black tracking-[-0.02em]">{title}</p>
      <p className="mt-2 flex items-center gap-2 text-[13px] leading-5 text-foreground/75">
        <StatusTag status={status} /> {statusLabel}
      </p>
      <SpecList className="mt-3" rows={rows} />
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
  summary: "Real hills, real weather, one small person. How CMR chooses, crops and treats photographs, and what it must be able to prove about each one.",
  plates: [
    {
      id: "library",
      title: "Three photographs.",
      nav: "The library",
      status: "established",
      lede: "That is the whole library today. A small set is not a weakness: it is why the site looks like one place and not a stock catalog.",
      render: () => (
        <>
          <div className={cn("grid gap-x-6 gap-y-10 md:grid-cols-3", PRINT_GROW, PRINT_ROWS_1)}>
            <LibraryCard
              title="The crest."
              status="established"
              statusLabel="Rights confirmed by the Owner."
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
              status="unresolved"
              statusLabel="Rights not yet verified."
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
              status="unresolved"
              statusLabel="Consent and rights not yet verified."
              rows={[
                ["Subject", "Two runners in a frosty field at sunrise, Cricket Hill behind"],
                ["Used", "About page card, black and white"],
                ["File", "2254 × 1301 px"],
              ]}
            >
              <div className="flex size-full items-center justify-center rounded-xl border border-dashed border-foreground/50 p-6 text-center">
                <p className="max-w-[26ch] text-p-sm text-foreground/70">
                  Not reproduced in this manual. It shows identifiable people, and consent for use beyond the About page has not been confirmed.
                </p>
              </div>
            </LibraryCard>
          </div>
          <Source className="mt-6">public/home/README.md (provenance of every image); rights status: Owner, 2026-11-13.</Source>
        </>
      ),
    },
    {
      id: "subject",
      title: "Small runner. Real hill.",
      nav: "Subject",
      status: "inferred",
      lede: "Three photographs are enough to see the pattern. The place is the subject. People are small in it or caught off guard in it, and nobody is performing athleticism for the camera.",
      render: () => (
        <div className={cn("grid gap-8 lg:grid-cols-12", PRINT_GROW)}>
          <Figure className={cn("lg:col-span-7", PRINT_FILL_COL)} caption="The homepage photograph, with no headline over it. The runner is a speck on the crest.">
            <Photo src={HERO} position="50% 74%" className={cn("aspect-[4/3]", PRINT_FILL)} sizes="(min-width: 1024px) 760px, 100vw" />
          </Figure>
          <div className="flex flex-col lg:col-span-5">
            <div className="grid gap-6">
              <Rule title="The hill is the hero.">Wide frames, low horizons, a lot of sky or a lot of grass. The terrain should look bigger than it is, by framing and not by retouching.</Rule>
              <Rule title="People are small, or candid.">A figure in the distance, or friends mid-laugh after a run. Not a posed start line, not a flexed calf.</Rule>
              <Rule title="Chicago, recognizably.">Lakefront grass, bare trees, a path worn into a sledding hill. If the picture could be Colorado, it is the wrong picture.</Rule>
              <Rule title="Whatever the weather is.">Frost, fog, flat gray light and long winter shadows are all on brand. Bad weather, good hills.</Rule>
            </div>
            <SpecTable
              className={PRINT_BOTTOM}
              caption="Photography subjects to avoid"
              head={["Not CMR", "Why"]}
              rows={[
                ["Stock mountains and ridgelines", "The joke only works if the hills are ours."],
                ["Staged group shots", "Official group runs are on hold. Never imply a run that did not happen."],
                ["Race-finish heroics", "The club is about showing up, not podiums."],
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
      status: "established",
      lede: "A photograph gets three things done to it, in this order: a crop, a light grade toward richer color, and the mesh gradient laid over the top. Nothing is retouched, stretched or generated.",
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
            <Figure className={PRINT_FILL_COL} caption={`Gradient at ${MESH_OPACITY.justShowUp}%: the most it is ever used.`}>
              <Photo src={HERO} gradient={MESH_OPACITY.justShowUp} className={PRINT_FILL} />
            </Figure>
          </div>
          <div className="mt-8 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <SpecList
                rows={[
                  ["1. Crop", "At the photograph's real proportions. Never stretched."],
                  ["2. Grade", "Saturation × 1.5, gamma 1.2"],
                  ["3. Gradient", `${MESH_OPACITY.hero}% (hero) or ${MESH_OPACITY.justShowUp}% (Just show up)`],
                  ["4. Shade, if type needs it", "30% black, under the gradient's photo"],
                ]}
              />
              <Source className="mt-4">scripts/assets/build-hero.mjs; src/components/PhotoBackdrop.tsx; src/components/home/JustShowUp.tsx.</Source>
            </div>
            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:col-span-6">
              <Rule title="Crop, never distort.">The approved design stretched the hill to look steeper. The build refused: the hill is as gentle as it really is.</Rule>
              <Rule title="People go black and white.">The one photograph of faces is monochrome with no gradient. Color washes are for landscapes.</Rule>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "crops",
      title: "One photograph, three crops.",
      nav: "Crops",
      status: "established",
      lede: "The hero is a single file. Each screen size shows a different window onto it, chosen so the crest of the hill, and the runner on it, stay in the lower part of the frame and clear of the headline.",
      render: () => (
        <>
          <div className={cn("@container flex flex-col gap-6 sm:flex-row sm:items-start", PRINT_GROW)}>
            <Crop label="Phone" w={393} h={614} position="50% 0%" note="Anchored to the top. The crest lands about 80% of the way down." />
            <Crop label="Tablet" w={768} h={670} position="50% 0%" note="Same anchor, wider window." />
            <Crop label="Desktop" w={1400} h={846} position="50% 77%" note="Shifted down so the crest sits about 72% of the way down." />
          </div>
          <div className={cn("mt-10 grid gap-x-8 gap-y-6 md:grid-cols-3", PRINT_BOTTOM)}>
            <Rule title="One master, positioned.">No separate art-directed files per device. The crop is a position on the same image, so it can never drift out of sync.</Rule>
            <Rule title="Keep the subject low.">Headlines sit in the sky. The thing you came to see sits under them, in the bottom third.</Rule>
            <Rule title="Mind the resolution.">The hero is 1920 px wide: sharp on most screens, about 6.4 in at 300 dpi. It is not a print file.</Rule>
          </div>
          <Source className="mt-6">src/components/home/HomeHero.tsx (object-position per breakpoint); public/home/README.md.</Source>
        </>
      ),
    },
    {
      id: "type",
      title: "Type on photographs.",
      nav: "Type on photos",
      status: "established",
      lede: "Display type goes straight onto the picture in solid white, with no shadow, glow or box. That is a deliberate look, and in two places it costs some contrast. Those two exceptions are recorded, not hidden.",
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
              <Rule title="Solid white, nothing added.">No text shadow, no halo, no translucent panel. If a line cannot be read, change the crop or add a shade to the whole photograph.</Rule>
              <Rule title="Buttons do not depend on the photo.">Every button on a photograph is a solid black or white fill with the opposite label: 21:1 whatever is behind it.</Rule>
              <Rule title="Focus rings flip.">On photographs and black, the focus ring is white with a black gap, so one of the two always shows.</Rule>
            </div>
            <div className={cn("grid gap-4", PRINT_BOTTOM)}>
              <Pending status="established" title="Accepted exception: the hero headline.">
                Over the palest sky it measures under 3:1, below WCAG AA for large text. The Owner accepted this on 2026-11-08. A tested alternative (a 75% band behind the headline) reaches 3.19:1 and is on file.
              </Pending>
              <Pending status="established" title="Accepted exception: “Just show up.” body copy.">
                With a 30% shade it measures about 3.6 to 4.0:1 where lines cross bright foliage, below the 4.5:1 minimum. Accepted the same day. A 42% shade with full-white copy reaches 4.5:1.
              </Pending>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "honesty",
      title: "Rights, and honesty.",
      nav: "Rights",
      status: "proposed",
      lede: "A photograph is a claim: this place, these people, this happened. CMR's whole manner depends on not overstating things, so every image has to pass the same five questions before it is used.",
      render: () => (
        <div className={cn("grid gap-8 lg:grid-cols-12", PRINT_GROW)}>
          <ol className="lg:col-span-7">
            {(
              [
                ["Who took it, and may CMR use it?", "Record the photographer and the permission. Until both are on file the image is marked unverified, as two of the three are now."],
                ["Is anyone recognizable?", "If so, they have agreed to this use, in this place. Consent for the About page is not consent for a shirt or an advertisement."],
                ["Is it where it says it is?", "Captions name the real location. A photograph of a hill is not evidence that CMR ran there, climbed it or counted it."],
                ["Does it imply something that did not happen?", "No staged group runs, no borrowed race photos, no crowd where there were two people."],
                ["Is it a photograph?", "Illustrations, maps, diagrams and AI-assisted artwork are labeled as what they are, and are never presented as photography."],
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
            <Pending status="established" title="No AI-generated photography.">
              Nothing on the site presents generated imagery as a photograph. The one AI-assisted piece, Science Figure 3, is an illustration made under the Owner&apos;s direction and is labeled as a figure.
            </Pending>
            <Pending status="unresolved" title="Two images still need paperwork." className={PRINT_BOTTOM}>
              The tree-line photograph and the About photograph have no rights or consent record yet. Do not reuse either outside the website until they do.
            </Pending>
          </div>
        </div>
      ),
    },
  ],
};
