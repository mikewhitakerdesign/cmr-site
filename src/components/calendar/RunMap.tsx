import Image from "next/image";
import { MapPinIcon } from "@/components/icons";

/**
 * The "Where to meet" map: a static, greyscale OpenStreetMap image (zoom 18, built
 * by scripts/assets/build-hill-maps.mjs --runs) with the Owner's exact Google Maps
 * pin drawn at `anchor` (fractions of the image, matching how the image was cut).
 * No embed, no script, no map service at runtime; attribution shown. A subtle
 * hover zoom moves the image only (CSS in cmr.css, off unless motion is allowed);
 * the pin, the attribution and the weather card beside it stay still.
 */
export function RunMap({ image, anchor, label, placeName }: { image: string; anchor: [number, number]; label: string; placeName: string }) {
  return (
    <figure
      data-slot="run-map"
      className="relative aspect-[3/2] rounded-xl bg-muted shadow-[0_8px_14px_rgba(65,65,65,0.28)]"
    >
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <Image
          src={image}
          alt={`Street map around ${placeName}. The pin marks the meeting place.`}
          fill
          sizes="(min-width: 1024px) 560px, (min-width: 768px) 704px, 100vw"
          quality={90}
          className="run-map-img object-cover"
        />
      </div>
      <div
        aria-hidden
        style={{ left: `${anchor[0] * 100}%`, top: `${anchor[1] * 100}%` }}
        className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center"
      >
        <span className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[13px] leading-4 font-medium whitespace-nowrap text-primary-foreground md:text-[14px] md:leading-5">
          <MapPinIcon className="size-4 shrink-0" />
          {label}
        </span>
        <span className="h-2.5 w-px bg-primary" />
        <span className="-mb-1 box-content size-2 rounded-full border-2 border-background bg-primary" />
      </div>
      <figcaption className="absolute right-0 bottom-0 rounded-tl-md rounded-br-xl bg-background/90 px-2 py-0.5 text-[11px] leading-4 text-foreground">
        ©{" "}
        <a href="https://www.openstreetmap.org/copyright" rel="noopener noreferrer" className="rounded-xs underline underline-offset-2 outline-none focus-visible:ring-3 focus-visible:ring-ring">
          OpenStreetMap
        </a>{" "}
        contributors
      </figcaption>
    </figure>
  );
}
