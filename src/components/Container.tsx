import type { ComponentProps, ElementType } from "react";
import { cn } from "@/lib/utils";

type ContainerProps<T extends ElementType> = { as?: T } & ComponentProps<T>;

/**
 * The CMR page container: 1400px max, 24px side padding below 768 and 48px
 * from 768 up (Figma: every Home frame; the same values Header and Footer use
 * inline). Content width is 1304px on desktop, 672 on tablet, 345 on mobile.
 */
export function Container<T extends ElementType = "div">({ as, className, ...props }: ContainerProps<T>) {
  const Comp: ElementType = as ?? "div";
  return <Comp className={cn("mx-auto w-full max-w-[1400px] px-6 md:px-12", className)} {...props} />;
}
