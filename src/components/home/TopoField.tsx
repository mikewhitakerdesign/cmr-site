"use client";

import { useEffect, useId, useRef, useState } from "react";

const VIEW = 1024; // public/home/topo.svg viewBox
const LENS_R = 120; // lens radius, in viewBox units (~170px at 1440 wide)
const MAX_SCALE = 34; // strongest displacement, viewBox units
const TOPO = "/home/topo.svg#topo";

/**
 * The "Flat is a state of mind" topographic background (homepage Round 2):
 * the approved line pattern as vector paths (public/home/topo.svg, traced from
 * the Figma fill), drawn at a constant 1.5px in 20% foreground — the original's
 * color — and cropped like `object-cover`.
 *
 * Liquid cursor: on devices with a fine pointer that can hover, and only
 * without a reduced-motion preference, a soft "lens" follows the pointer with a
 * slight lag. Inside it the lines are pushed around by an SVG turbulence
 * displacement whose strength follows pointer speed and decays to nothing when
 * the pointer rests. The filter is confined to the lens's box, and the
 * animation frame loop stops once everything settles, so an idle page does no
 * work. Touch, coarse pointers and reduced motion get the static pattern.
 * The text above is a separate layer and never moves.
 */
export function TopoField() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia?.("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!fine || !reduce) return;
    const update = () => setLive(fine.matches && !reduce.matches);
    update();
    fine.addEventListener("change", update);
    reduce.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      reduce.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    const host = svg?.closest("section");
    if (!live || !svg || !host) return;
    const q = (sel: string) => svg.querySelectorAll<SVGElement>(sel);
    const lenses = q("[data-lens]");
    const filter = svg.querySelector<SVGFilterElement>("[data-liquid]")!;
    const disp = svg.querySelector<SVGFEDisplacementMapElement>("feDisplacementMap")!;

    const target = { x: VIEW / 2, y: VIEW / 2 };
    const pos = { ...target };
    let energy = 0, inside = false, frame = 0, last = { x: 0, y: 0, t: 0 };

    const toView = (cx: number, cy: number) => {
      const m = svg.getScreenCTM();
      if (!m) return null;
      const p = new DOMPoint(cx, cy).matrixTransform(m.inverse());
      return { x: p.x, y: p.y };
    };
    const draw = () => {
      const r = inside || energy > 0.02 ? LENS_R : 0;
      lenses.forEach((c) => {
        c.setAttribute("cx", pos.x.toFixed(1));
        c.setAttribute("cy", pos.y.toFixed(1));
        c.setAttribute("r", String(r));
      });
      const pad = LENS_R * 1.25;
      filter.setAttribute("x", (pos.x - pad).toFixed(1));
      filter.setAttribute("y", (pos.y - pad).toFixed(1));
      disp.setAttribute("scale", (energy * MAX_SCALE).toFixed(2));
    };
    const tick = () => {
      frame = 0;
      pos.x += (target.x - pos.x) * 0.16; // lag = the "gooey" follow
      pos.y += (target.y - pos.y) * 0.16;
      energy *= 0.93;
      draw();
      const moving = Math.hypot(target.x - pos.x, target.y - pos.y) > 0.5;
      if (energy > 0.01 || moving) frame = requestAnimationFrame(tick);
      else {
        energy = 0;
        draw();
      }
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      const p = toView(e.clientX, e.clientY);
      if (!p) return;
      if (!inside) {
        pos.x = p.x;
        pos.y = p.y;
        last = { x: e.clientX, y: e.clientY, t: e.timeStamp };
      }
      inside = true;
      const dt = Math.max(8, e.timeStamp - last.t);
      const speed = Math.hypot(e.clientX - last.x, e.clientY - last.y) / dt; // px per ms
      last = { x: e.clientX, y: e.clientY, t: e.timeStamp };
      energy = Math.min(1, energy + speed * 0.35);
      target.x = p.x;
      target.y = p.y;
      kick();
    };
    const onLeave = () => {
      inside = false;
      kick();
    };
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, [live]);

  const id = (name: string) => `${name}-${uid}`;
  return (
    <svg
      ref={svgRef}
      aria-hidden
      data-slot="topo-field"
      data-live={live || undefined}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 size-full text-foreground/20"
    >
      {live && (
        <defs>
          <filter
            id={id("liquid")}
            data-liquid
            filterUnits="userSpaceOnUse"
            x={0}
            y={0}
            width={LENS_R * 2.5}
            height={LENS_R * 2.5}
          >
            <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={7} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={0} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <radialGradient id={id("lens-in")}>
            <stop offset="0.45" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </radialGradient>
          <radialGradient id={id("lens-out")}>
            <stop offset="0.45" stopColor="#000" />
            <stop offset="1" stopColor="#fff" />
          </radialGradient>
          <mask id={id("mask-in")} maskUnits="userSpaceOnUse" x={0} y={0} width={VIEW} height={VIEW}>
            <circle data-lens cx={0} cy={0} r={0} fill={`url(#${id("lens-in")})`} />
          </mask>
          <mask id={id("mask-out")} maskUnits="userSpaceOnUse" x={0} y={0} width={VIEW} height={VIEW}>
            <rect width={VIEW} height={VIEW} fill="#fff" />
            <circle data-lens cx={0} cy={0} r={0} fill={`url(#${id("lens-out")})`} />
          </mask>
        </defs>
      )}
      <g stroke="currentColor" strokeWidth={1.5}>
        <use href={TOPO} mask={live ? `url(#${id("mask-out")})` : undefined} />
        {live && (
          <g mask={`url(#${id("mask-in")})`}>
            <use href={TOPO} filter={`url(#${id("liquid")})`} />
          </g>
        )}
      </g>
    </svg>
  );
}
