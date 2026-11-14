import type { ReactNode } from "react";
import { Rule, SpecTable } from "@/components/brand/kit";
import { LABEL, PRINT_BOTTOM, PRINT_GROW } from "@/components/brand/styles";
import { LOGO_DOWNLOADS, MANUAL, SITE_HOST, type BrandChapter } from "@/lib/brand/manual";
import { cn } from "@/lib/utils";

function Tier({ n, name, where, children }: { n: number; name: string; where: string; children: ReactNode }) {
  return (
    <li className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-4 border-t border-foreground py-4 md:grid-cols-[3rem_minmax(0,4fr)_minmax(0,6fr)] [.brand-print_&]:py-3.5">
      <span className="text-[40px] leading-none font-black tracking-[-0.04em]">{n}</span>
      <div>
        <p className="text-[22px] leading-7 font-black tracking-[-0.02em]">{name}</p>
        <p className="mt-1 font-mono text-[12px] leading-[18px] wrap-anywhere text-foreground/65">{where}</p>
      </div>
      <p className="col-start-2 mt-2 text-p-sm text-foreground/75 md:col-start-3 md:mt-1">{children}</p>
    </li>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <li className="flex flex-1 flex-col border-t border-foreground pt-4">
      <span className="font-mono text-[13px] leading-5 text-foreground/65">{String(n).padStart(2, "0")}</span>
      <span className="mt-1 text-[20px] leading-6 font-black tracking-[-0.02em]">{title}</span>
      <span className="mt-2 text-p-sm text-foreground/75">{children}</span>
    </li>
  );
}

/** A numbered line in the decided / still-open lists. */
function Item({ n, children }: { n: number; children: ReactNode }) {
  return (
    <li className="grid grid-cols-[2rem_1fr] gap-x-3 border-b border-foreground/20 py-2.5 text-p-sm [.brand-print_&]:py-2 [.brand-print_&]:text-[13.5px] [.brand-print_&]:leading-[19px]">
      <span className="font-mono text-[13px] text-foreground/65">{String(n).padStart(2, "0")}</span>
      <span className="text-foreground/85">{children}</span>
    </li>
  );
}

export const governance: BrandChapter = {
  slug: "governance",
  number: "09",
  title: "Governance.",
  name: "Governance",
  summary: "Who decides, where the real files are, how to use them, and how the standards stay current as the brand grows.",
  plates: [
    {
      id: "truth",
      title: "Who decides.",
      nav: "Who decides",
      lede: "CMR has one Owner, who decides anything that changes how the brand looks or sounds. When two references disagree, the one higher on this list wins, and the lower one gets fixed.",
      render: () => (
        <div className={PRINT_GROW}>
          <ol>
            <Tier n={1} name="The Owner." where="Michael Whitaker, Founder and Director">
              Decides the marks, colors, typefaces, voice and these standards. A decision stands until a later one replaces it.
            </Tier>
            <Tier n={2} name="The approved files." where={`The logo files · ${SITE_HOST}${LOGO_DOWNLOADS.section}`}>
              The badge and wordmark masters, as supplied. If a screenshot, a mockup or this manual differs from them, the files are right.
            </Tier>
            <Tier n={3} name="The design tokens." where="Figma: MWDS, CMR theme">
              Colors, type scale, spacing and radii. Changed in Figma and re-exported; never edited by hand downstream.
            </Tier>
            <Tier n={4} name="This manual." where={`${SITE_HOST}/brand · the PDF`}>
              How the pieces are used together. It reads its values from the files and tokens above, so it cannot quietly disagree with them.
            </Tier>
            <Tier n={5} name="The live website." where={SITE_HOST}>
              The fullest application of the brand, and the best reference for anything the manual does not cover. Not the place to settle a disagreement: it can have bugs too.
            </Tier>
          </ol>
        </div>
      ),
    },
    {
      id: "assets",
      title: "Asset index.",
      nav: "Assets",
      lede: "Every piece of brand artwork, where to get it, and what it is for. If a file is not on this list, it is not a CMR brand asset.",
      render: () => (
        <>
          <SpecTable
            caption="CMR brand assets: where to get them and what they are for"
            head={["Asset", "Where", "Format", "Use"]}
            rows={[
              ["Badge", "Marks › Files (download)", "SVG master, PNG", "Everything. Black or white."],
              ["Wordmark", "Marks › Files (download)", "SVG master, PNG", "When the full name is needed. Black or white."],
              ["Site icon", "The website", "SVG, ICO, PNG", "Browser tabs and home screens. The badge's outline only."],
              ["Hill silhouette", "The website (homepage)", "Image", "Beside the brand statement, on the web. Ask before other use."],
              ["Contour pattern", "On request", "SVG", "Backgrounds and details, at any size."],
              ["Hill profiles (5)", "The website (hills)", "SVG", "With their ≈ figures and data caption."],
              ["Mesh gradient", "On request", "Image", "Over photographs. Remade at size for print."],
              ["Hero photograph", "On request", "JPEG", "The Owner's photograph. Cleared."],
              ["Other photographs", "The website", "JPEG", "Where they are used now; ask before any other use."],
              ["Fonts", "The publisher (Vercel)", "Geist, Geist Mono", "Free under the SIL Open Font License. Not redistributed by CMR."],
            ]}
          />
          <p className={cn("mt-6 max-w-[80ch] text-p-sm text-foreground/75", PRINT_BOTTOM)}>
            &ldquo;On request&rdquo; means through the Questions form on any page of the site. Files that are not offered for download are supplied for a specific, approved job.
          </p>
        </>
      ),
    },
    {
      id: "use",
      title: "Using the brand.",
      nav: "Using it",
      lede: "The marks belong to Chicago Mountain Runners. Using them on something new is by permission, and permission is specific: this mark, on this thing, for this purpose. Ask through the Questions form; it is usually a quick yes.",
      render: () => (
        <div className={cn("grid gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-3", PRINT_GROW, "[.brand-print_&]:content-start")}>
          <Rule title="Use the supplied files.">Download them from the manual or ask for them. Never lift a mark from a screenshot or a web page, and never redraw one.</Rule>
          <Rule title="Ask before making things.">Shirts, stickers, signs, a group&apos;s own graphics: anything new with the marks on it is approved by the Owner first.</Rule>
          <Rule title="Vendors reproduce, not adjust.">A printer or embroiderer works from the master and sends a proof. Any change for production (simplifying, thickening, dropping the ™) is approved first.</Rule>
          <Rule title="Respect image rights.">Use a photograph only where its permission covers. Recognizable people have agreed to the use. See Photography.</Rule>
          <Rule title="No casual co-branding.">Another organization&apos;s logo beside the badge implies a relationship. It appears only when that relationship is real and agreed.</Rule>
          <Rule title="No legal claims.">The ™ appears as supplied. This manual is brand guidance, not a license, and makes no statement about registration or enforcement.</Rule>
        </div>
      ),
    },
    {
      id: "changes",
      title: "Keeping it current.",
      nav: "Keeping current",
      lede: "The website, this manual, the PDF and the logo files describe one brand, so they change together. A standard changes because the Owner decided it, never because something shipped looking different.",
      render: () => (
        <>
          <ol className={cn("grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4", PRINT_GROW, "[.brand-print_&]:content-start")}>
            <Step n={1} title="Decide.">The Owner approves the change: a new color, a revised rule, a new file.</Step>
            <Step n={2} title="Change the source.">Artwork in its master file, values in Figma, words in the manual. Never by editing the PDF or a downloaded file.</Step>
            <Step n={3} title="Check it.">Build the site, look at the pages, regenerate the PDF and the logo files. Contrast is measured, not assumed.</Step>
            <Step n={4} title="Release together.">The site, the manual, the PDF and the files go out in the same change, with the version number raised.</Step>
          </ol>
          <div className={cn("mt-10 grid gap-8 lg:grid-cols-12", PRINT_BOTTOM)}>
            <div className="lg:col-span-7">
              <SpecTable
                caption="Versions and file names"
                head={["Convention", "Rule", "Example"]}
                mono={[2]}
                rows={[
                  ["Manual version", "A whole number for each edition the Owner approves; a decimal for corrections.", `${MANUAL.version}`],
                  ["Logo files", "Lowercase, hyphenated, cmr-, the mark, then the color.", "cmr-badge-white.svg"],
                  ["Replacing a master", "A new file, approved by the Owner. The old one stays in the history.", "—"],
                ]}
              />
            </div>
            <div className="grid content-start gap-6 lg:col-span-5">
              <Rule title="Material means visible.">A change a member could notice (a mark, a color, a typeface, a tagline) is the Owner&apos;s decision. Fixing a typo is not.</Rule>
              <Rule title="Grow it as the brand grows.">New chapters (apparel, for one) are added when there is real work to describe, not before.</Rule>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "open",
      title: "Decided, and still open.",
      nav: "Decided and open",
      lede: "What this edition settles, and the short list of things that still need a proof, a file or a decision before they can be specified.",
      render: () => (
        <div className={cn("grid gap-x-12 gap-y-10 lg:grid-cols-12", PRINT_GROW)}>
          <div className="lg:col-span-7">
            <h3 className={cn(LABEL, "mb-2 text-foreground/65")}>Decided</h3>
            <ol className="border-t border-foreground">
              <Item n={1}>The badge is the primary identity; the stacked wordmark is the full name.</Item>
              <Item n={2}>The vector badge is the production master.</Item>
              <Item n={3}>The site icon is the badge&apos;s outline alone, with no letters.</Item>
              <Item n={4}>Primary colors are pure #000000 and #FFFFFF; the neutral scale is unchanged.</Item>
              <Item n={5}>The badge is never shown narrower than 96 px on screen (provisional).</Item>
              <Item n={6}>No Pantone, CMYK or thread colors are specified until they are proofed.</Item>
              <Item n={7}>Image rights are respected as recorded, and unknown rights are not assumed.</Item>
              <Item n={8}>The expressions may be pursued as trademarks; the manual makes no legal claims.</Item>
              <Item n={9}>Apparel is deferred until there are real items, vendors and requirements.</Item>
              <Item n={10}>Using the brand is by permission, kept simple.</Item>
            </ol>
          </div>
          <div className="lg:col-span-5">
            <h3 className={cn(LABEL, "mb-2 text-foreground/65")}>Still open</h3>
            <ol className="border-t border-foreground">
              <Item n={1}>Smallest sizes in print, embroidery and other materials: set with a vendor, from a proof.</Item>
              <Item n={2}>Print colors: matched with a printer, on the real material.</Item>
              <Item n={3}>Print artwork for tie-dye and the gradient.</Item>
              <Item n={4}>A vector of the hill silhouette, for any use beyond the website.</Item>
              <Item n={5}>Rights for the tree-line photograph.</Item>
              <Item n={6}>The homepage headline&apos;s contrast (see Photography).</Item>
              <Item n={7}>A social sharing image.</Item>
            </ol>
          </div>
        </div>
      ),
    },
  ],
};
