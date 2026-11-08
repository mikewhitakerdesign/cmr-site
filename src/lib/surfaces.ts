/**
 * Focus treatment per surface. MWDS `focus/ring` is black in the CMR theme,
 * which disappears on black sections and dark photography. Dark and photo
 * surfaces therefore swap the ring to the inverse token and draw the 2px
 * offset gap in black: on any photo, either the white ring or the black gap
 * contrasts with what is behind it. Same local-override pattern the footer
 * uses for `--focus-offset` (foundation decision 5); tokens only.
 *
 *   white (default)  ring black, gap white
 *   mint (footer)    ring black, gap mint      — set by Footer
 *   black / photo    ring white, gap black     — `onDarkSurface`
 */
export const onDarkSurface = "[--ring:var(--primary-foreground)] [--focus-offset:var(--primary)]";
