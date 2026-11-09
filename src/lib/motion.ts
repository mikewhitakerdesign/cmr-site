/**
 * The site's one decorative-motion preference. `<html data-motion="on|off">`,
 * set before first paint by MOTION_INIT_SCRIPT:
 *
 *   - an explicit choice from the footer control (kept in localStorage), else
 *   - "off" when the visitor's system asks for reduced motion, else "on".
 *
 * Decorative animation (weather glyphs, the contour backgrounds, the odometer
 * counts) reads it: CSS through `html[data-motion="on"]`, scripts through
 * `motionOff()` and the `cmr-motion` event. Functional transitions (hover, focus,
 * navigation, scroll) are not governed by it and keep honoring the system
 * setting on their own. No dependency; localStorage may throw, so every use is guarded.
 */
export const MOTION_KEY = "cmr-motion";
export const MOTION_EVENT = "cmr-motion";
export type Motion = "on" | "off";

export const MOTION_INIT_SCRIPT = `(function(){var d=document.documentElement,m="on";try{var r=window.matchMedia("(prefers-reduced-motion: reduce)").matches;var s=null;try{s=localStorage.getItem("${MOTION_KEY}")}catch(e){}m=s==="on"||s==="off"?s:(r?"off":"on")}catch(e){}d.setAttribute("data-motion",m)})();`;

export function storedMotion(): Motion | null {
  try {
    const v = localStorage.getItem(MOTION_KEY);
    return v === "on" || v === "off" ? v : null;
  } catch {
    return null;
  }
}

/** The current state: the attribute the init script set, else the system preference. */
export function currentMotion(): Motion {
  const attr = document.documentElement.getAttribute("data-motion");
  if (attr === "on" || attr === "off") return attr;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "off" : "on";
}

export const motionOff = () => currentMotion() === "off";

export function applyMotion(m: Motion) {
  document.documentElement.setAttribute("data-motion", m);
  window.dispatchEvent(new Event(MOTION_EVENT));
}

/** An explicit visitor choice: apply it and remember it on this device. */
export function chooseMotion(m: Motion) {
  try {
    localStorage.setItem(MOTION_KEY, m);
  } catch {
    /* private mode: the choice lasts for this page only */
  }
  applyMotion(m);
}
