import type { ReactNode } from "react";
import { Pending, Rule, Source, SpecTable, StatusTag } from "@/components/brand/kit";
import { LABEL, PRINT_BOTTOM, PRINT_GROW } from "@/components/brand/styles";
import { MANUAL, SITE_HOST, STATUS, type BrandChapter, type Status } from "@/lib/brand/manual";
import { cn } from "@/lib/utils";

function Tier({ n, name, where, children }: { n: number; name: string; where: string; children: ReactNode }) {
  return (
    <li className="grid grid-cols-[3rem_1fr] gap-x-4 border-t border-foreground py-4 md:grid-cols-[3rem_minmax(0,4fr)_minmax(0,6fr)] [.brand-print_&]:py-3.5">
      <span className="text-[40px] leading-none font-black tracking-[-0.04em]">{n}</span>
      <div>
        <p className="text-[22px] leading-7 font-black tracking-[-0.02em]">{name}</p>
        <p className="mt-1 font-mono text-[12px] leading-[18px] text-foreground/65">{where}</p>
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

const tag = (s: Status) => <StatusTag key={s} status={s} />;

export const governance: BrandChapter = {
  slug: "governance",
  number: "10",
  title: "Governance.",
  name: "Governance",
  summary: "Who decides, where the real files are, how a standard changes, and the list of things nobody has decided yet.",
  plates: [
    {
      id: "truth",
      title: "Source of truth.",
      nav: "Source of truth",
      status: "established",
      lede: "When two things disagree, the one higher on this list wins, and the lower one gets fixed. This manual is fourth. It describes the brand; it does not outrank the artwork or the Owner.",
      render: () => (
        <div className={PRINT_GROW}>
          <ol>
            <Tier n={1} name="The Owner's decision." where=".aiom/approvals · .aiom/work">
              Michael Whitaker, Founder and Director, holds authority over the identity. A recorded decision settles a question until a later recorded decision replaces it.
            </Tier>
            <Tier n={2} name="Approved artwork." where="Figma: CMR design file · public/brand">
              The marks and approved page designs, as supplied. If a screenshot, a mockup or this manual differs from the artwork, the artwork is right.
            </Tier>
            <Tier n={3} name="Design tokens." where="Figma: MWDS, CMR theme · tokens/mwds">
              Colors, type scale, spacing and radii. Changed in Figma and re-exported; never edited by hand downstream.
            </Tier>
            <Tier n={4} name="This manual." where="/brand · src/content/brand · the PDF">
              How the pieces are used together. It reads its values from tiers 2 and 3, so it cannot quietly disagree with them.
            </Tier>
            <Tier n={5} name="The live website." where={SITE_HOST}>
              The most complete application of the brand, and the best reference for anything the manual does not cover. Not a place to settle disputes: bugs live there too.
            </Tier>
          </ol>
          <Source className="mt-6">AGENTS.md; .aiom/seed/core.md (Owner authority); tokens/README.md.</Source>
        </div>
      ),
    },
    {
      id: "assets",
      title: "Asset index.",
      nav: "Assets",
      status: "established",
      lede: "Every piece of brand artwork, where its master lives, and what it may be used for. If a file is not on this list, it is not a CMR brand asset.",
      render: () => (
        <>
          <SpecTable
            caption="CMR brand assets: location, format, status and permitted use"
            head={["Asset", "Location", "Format", "Status", "Use"]}
            mono={[1]}
            rows={[
              ["Badge", "public/brand/cmr-logo-art.png, -mask-*.svg", "PNG + masks", tag("established"), "Screen. Not for print enlargement."],
              ["Badge, vector", "public/brand/proposed/cmr-badge-proposed.svg", "SVG", tag("proposed"), "Review only until approved."],
              ["Wordmark", "public/brand/cmr-wordmark.svg", "SVG (traced)", tag("established"), "Screen and print, one color."],
              ["Wordmark, type source", "Figma 113:467", "Live text", tag("established"), "Source for a true outline master."],
              ["Hill silhouette", "public/home/community-mark.png", "PNG", tag("established"), "Web only, beside the statement."],
              ["Contour pattern", "public/home/topo.svg", "SVG, 141 paths", tag("established"), "Any size. Line weight set per use."],
              ["Hill profiles (5)", "public/hills/*-profile.svg", "SVG", tag("established"), "With their ≈ figures and data caption."],
              ["Mesh gradient", "public/home/mesh-gradient.png", "PNG, baked", tag("established"), "Over photographs. Regenerate at size for print."],
              ["Hero photograph", "public/home/hero.jpg (+ original in scripts/assets/source)", "JPEG", tag("established"), "Owner's photograph. Rights confirmed."],
              ["Other photographs (2)", "public/home, public/about", "JPEG", tag("unresolved"), "Website only until rights and consent are on file."],
              ["Science Figure 3", "public/science/uphill-push-off.png", "PNG", tag("established"), "Owner-directed, AI-assisted illustration. Captioned as a figure."],
              ["Icons", "src/components/icons.tsx", "Inline SVG", tag("established"), "Interface only, beside a label."],
              ["Fonts", "Not stored. Geist, Geist Mono from the publisher.", "OFL 1.1", tag("established"), "Download with the license; do not redistribute."],
            ]}
          />
          <Source className="mt-4">public/home/README.md records the provenance and processing of each image file.</Source>
        </>
      ),
    },
    {
      id: "changes",
      title: "Changing a standard.",
      nav: "Changes",
      status: "established",
      lede: "The brand changes the way the website does: a written request, the Owner's approval, a reviewed change, a check, then release. No standard changes because someone shipped something different.",
      render: () => (
        <>
          <ol className={cn("grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-5", PRINT_GROW)}>
            <Step n={1} title="Write it down.">
              A work item says what should change and why, with the evidence. Small is fine; unwritten is not.
            </Step>
            <Step n={2} title="Owner approves.">
              Material changes to marks, color, type, voice or these rules need the Owner&apos;s recorded approval before work starts.
            </Step>
            <Step n={3} title="Change the source.">
              Artwork in Figma or public/brand, tokens in Figma, rules in src/content/brand. On a branch, never on the live site.
            </Step>
            <Step n={4} title="Check it.">
              Tests, a build, and a look at the pages and the PDF. Contrast is recomputed, not assumed.
            </Step>
            <Step n={5} title="Release together.">
              The website, this manual and the PDF ship in the same change, with the version number raised.
            </Step>
          </ol>
          <div className={cn("mt-10 grid gap-8 lg:grid-cols-12", PRINT_BOTTOM)}>
            <div className="lg:col-span-7">
              <SpecTable
                caption="Brand Standards versioning and file naming conventions"
                head={["Convention", "Rule", "Example"]}
                mono={[2]}
                rows={[
                  ["Manual version", "Whole number for an Owner-approved edition; decimal for revisions.", `${MANUAL.version}: ${MANUAL.status.toLowerCase()}`],
                  ["Asset file names", "Lowercase, hyphenated, prefixed cmr-, named for what it is.", "cmr-wordmark.svg"],
                  ["Unapproved artwork", "Kept in a folder named proposed, and named so.", "proposed/cmr-badge-proposed.svg"],
                  ["Replacing a master", "A new file and a recorded approval. The old one stays in history.", "git log public/brand"],
                ]}
              />
            </div>
            <div className="grid gap-6 lg:col-span-5">
              <Rule title="Material means visible.">A change a member could notice (a mark, a color, a typeface, a tagline) is material. Fixing a typo in this manual is not.</Rule>
              <Rule title="The PDF is rebuilt, never edited.">It is printed from the site by a script. Editing the PDF by hand would make it disagree with the source.</Rule>
            </div>
          </div>
          <Source className="mt-6">.aiom/work, .aiom/approvals; scripts/brand/build-pdf.mjs; docs/brand-standards.md.</Source>
        </>
      ),
    },
    {
      id: "use",
      title: "Who may use what.",
      nav: "Usage",
      status: "proposed",
      lede: "The marks belong to Chicago Mountain Runners. Using them is by permission, and permission is specific: this mark, on this thing, for this purpose. The table is a proposed starting policy for the Owner to confirm.",
      render: () => (
        <>
          <SpecTable
            caption="Proposed permissions for using CMR brand assets"
            head={["Who", "May", "Needs the Owner's approval first"]}
            rows={[
              ["The Owner", "Everything.", "Nothing. The Owner is the approval."],
              ["People building the site", "Use approved assets and tokens as these standards describe.", "Any new asset, any change to an existing one, any exception."],
              ["Members", "Wear and share official items; link to the site; use the name in conversation.", "Making anything with the marks on it, including for a group they organize."],
              ["Partners and sponsors", "Nothing by default.", "Every use. Approved artwork is supplied; marks are never taken from the website."],
              ["Vendors", "Reproduce the supplied master exactly, for the approved item.", "Any adjustment for production: redrawing, simplifying, dropping the ™, recoloring."],
              ["Press and community", "Use the name; quote the site with a link.", "Using the marks in a publication."],
            ]}
          />
          <div className={cn("mt-8 grid gap-8 lg:grid-cols-12", PRINT_BOTTOM)}>
            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:col-span-8">
              <Rule title="CMR does not co-brand casually.">Another organization&apos;s logo beside the badge implies a relationship. It appears only when that relationship is real and agreed.</Rule>
              <Rule title="Exceptions are recorded.">An approved departure from these standards is written down with its reason, like the two contrast exceptions in Photography.</Rule>
            </div>
            <div className="lg:col-span-4">
              <Pending status="unresolved" title="No legal terms are stated here.">
                This is brand guidance, not a license. The ™ is shown as supplied; this manual makes no statement about registration or enforcement.
              </Pending>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "reviews",
      title: "Reviews.",
      nav: "Reviews",
      status: "proposed",
      lede: "Three checks keep the standards true. One already runs automatically on every change to the site. The other two are habits to adopt as the brand starts making physical things.",
      render: () => (
        <div className={cn("grid gap-8 lg:grid-cols-12", PRINT_GROW)}>
          <div className="lg:col-span-8">
            <SpecTable
              caption="Brand review types, timing and checks"
              head={["Review", "When", "Checks", "Status"]}
              rows={[
                ["Accessibility", "Every change to the site, automatically.", "Axe at 393, 768 and 1440 px; contrast; keyboard paths; focus visibility.", tag("established")],
                ["Token integrity", "Every change, automatically.", "Token files match their Figma checksums; generated CSS is current; values resolve as Figma resolves them.", tag("established")],
                ["Manual integrity", "Every change to the manual.", "Values mirror their sources; every PDF page fits its sheet; page count is as declared.", tag("established")],
                ["Print production", "Before any item is produced.", "The Apparel checklist: approved master, physical proof, color on the material.", tag("proposed")],
                ["Brand review", "At each new edition, and before a first use in a new medium.", "Does it look and sound like CMR? Are proposals still marked as proposals?", tag("proposed")],
                ["Rights audit", "When an image is added or reused somewhere new.", "Photographer, permission and consent on file.", tag("proposed")],
              ]}
            />
            <Source className="mt-4">.github/workflows/ci.yml; tests/tokens.test.ts; tests/lib/brand.test.ts; scripts/brand/build-pdf.mjs.</Source>
          </div>
          <div className="flex flex-col gap-6 lg:col-span-4">
            <Rule title="Judgment is not a test.">A passing build says the numbers are right. Whether something is on brand is a human call, and it is the Owner&apos;s.</Rule>
            <Rule title="Review the status tags.">At each edition, every Proposed and Unresolved tag is either promoted, changed or kept on purpose.</Rule>
            <div className={cn("rounded-lg bg-muted p-5", PRINT_BOTTOM, "[.brand-print_&]:pt-5")}>
              <p className={cn(LABEL, "text-foreground/65")}>The four tags</p>
              <ul className="mt-3 space-y-2">
                {(Object.keys(STATUS) as Status[]).map((s) => (
                  <li key={s} className="flex items-baseline gap-3">
                    <StatusTag status={s} className="w-[96px] shrink-0 justify-center" />
                    <span className="text-[13px] leading-[18px] text-foreground/75">{STATUS[s].meaning}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "open",
      title: "Open decisions.",
      nav: "Open decisions",
      status: "unresolved",
      lede: "What this edition could not settle. Each line names who can settle it and what would close it. An honest list is more useful than a finished-looking manual.",
      render: () => (
        <>
          <SpecTable
            caption="Register of open brand decisions"
            head={["#", "Question", "Now", "Closes when"]}
            mono={[0]}
            rows={[
              ["01", "Is the logo hierarchy final?", "Adopted provisionally: badge, wordmark, silhouette.", "The Owner confirms after visual review."],
              ["02", "Is the proposed vector badge the master?", "Traced from the approved raster; not in use.", "The Owner approves it, or supplies an original vector."],
              ["03", "What are the favicon and social image?", "Neither exists. The site serves a default icon.", "A small-format avatar is designed and approved."],
              ["04", "What is the final color hierarchy?", "Mint is the core accent; cream is available; pastels and gradient are expressive.", "The Owner confirms after visual review."],
              ["05", "What are the minimum sizes?", "72 px on screen is proposed. Print and embroidery are untested.", "Proofs are made on real materials."],
              ["06", "What are the print colors?", "sRGB only. CMYK shown is unproofed arithmetic.", "Spot or process values are matched with a printer."],
              ["07", "Are two photographs cleared?", "The tree line and the About photograph have no record.", "Rights and consent are on file, or the images are replaced."],
              ["08", "What does the ™ assert?", "Shown as supplied. No claim is made.", "The Owner states the position, with advice if wanted."],
              ["09", "What is the first merchandise item?", "No approved artwork, vendor or proof.", "One item completes the Apparel checklist."],
              ["10", "Who may use the marks?", "A proposed table, on the previous pages.", "The Owner confirms or replaces it."],
            ]}
          />
          <div className={cn("mt-8 grid gap-4 md:grid-cols-2", PRINT_BOTTOM)}>
            <Pending status="established" title="Already decided, for the record.">
              Terminology (club, running community, group runs); the three expressions as expressions; mint and cream retained; hero photograph rights; the provenance of Science Figure 3. Owner, 2026-11-13.
            </Pending>
            <Pending status="proposed" title="Next edition.">
              Version 1.0 is the first edition the Owner approves as a whole. Until then every page of this manual is a review draft, however finished it looks.
            </Pending>
          </div>
        </>
      ),
    },
  ],
};
