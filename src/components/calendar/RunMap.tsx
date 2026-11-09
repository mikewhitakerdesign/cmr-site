import Image from "next/image";
import { MapPinIcon } from "@/components/icons";

/**
 * The "Where to meet" map: a static, greyscale OpenStreetMap image centred on the
 * Owner's exact Google Maps pin (scripts/assets/build-hill-maps.mjs --runs), so
 * the pin sits at the centre. Same approach as the hill pages: no embed, no
 * script, no map service called at runtime, attribution shown. On desktop it
 * fills the height of the column beside it; elsewhere it keeps a 4:3 frame.
 */
export function RunMap({ image, label, placeName }: { image: string; label: string; placeName: string }) {
  return (
    <figure data-slot="run-map" className="relative aspect-[4/3] overflow-hidden rounded-xl border border-foreground bg-muted lg:aspect-auto lg:h-full lg:min-h-[420px]">
      <Image
        src={image}
        alt={`Street map around ${placeName}. The pin marks the meeting place.`}
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover"
      />
      <div aria-hidden className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-full flex-col items-center">
        <span className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[13px] leading-4 font-medium whitespace-nowrap text-primary-foreground md:text-[14px] md:leading-5">
          <MapPinIcon className="size-4 shrink-0" />
          {label}
        </span>
        <span className="h-2.5 w-px bg-primary" />
        <span className="-mb-1 box-content size-2 rounded-full border-2 border-background bg-primary" />
      </div>
      <figcaption className="absolute right-0 bottom-0 rounded-tl-md bg-background/90 px-2 py-0.5 text-[11px] leading-4 text-foreground">
        ©{" "}
        <a href="https://www.openstreetmap.org/copyright" rel="noopener noreferrer" className="rounded-xs underline underline-offset-2 outline-none focus-visible:ring-3 focus-visible:ring-ring">
          OpenStreetMap
        </a>{" "}
        contributors
      </figcaption>
    </figure>
  );
}
