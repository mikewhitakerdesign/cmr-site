/**
 * A decorative top-down contour drawing: nested, slightly irregular closed
 * rings in a black 1px line, different for each hill (seeded by the slug).
 * It is NOT measured terrain and is not built from the hill's elevation data;
 * it is artwork, hidden from assistive technology, and says so here so it is
 * never mistaken for a map.
 */
const seedFor = (slug: string) => [...slug].reduce((n, c) => (n * 31 + c.charCodeAt(0)) % 9973, 17);

/** Space kept clear around the outermost ring, in viewBox units (about 8px at the 240px desktop size). */
const PAD = 8;

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function HillContourArt({ slug, className }: { slug: string; className?: string }) {
  const r = rand(seedFor(slug));
  const [p1, p2, p3] = [r() * 6.28, r() * 6.28, r() * 6.28];
  const [a2, a3, a4] = [0.1 + r() * 0.08, 0.06 + r() * 0.06, 0.03 + r() * 0.03];
  const rings = 8;
  const rings_ = Array.from({ length: rings }, (_, k) => {
    const t = (k + 1) / rings; // outermost ring last
    const R = 14 + 104 * t;
    // Inner rings drift toward a summit offset, so the spacing is uneven like real contours.
    const cx = 120 + (1 - t) * 18 * Math.cos(p1);
    const cy = 120 + (1 - t) * 18 * Math.sin(p1);
    return Array.from({ length: 72 }, (_, i): [number, number] => {
      const th = (i / 72) * Math.PI * 2;
      const f = 1 + a2 * Math.sin(2 * th + p1) + a3 * Math.sin(3 * th + p2) + a4 * Math.sin(5 * th + p3);
      return [cx + R * f * Math.cos(th), cy + R * f * Math.sin(th)];
    });
  });
  // The irregular outer rings can reach past the nominal 240 box, which clipped them. Fit a square
  // viewBox to the drawing's real bounds plus breathing room, so every ring is whole at any size.
  const xs = rings_.flat().map((q) => q[0]);
  const ys = rings_.flat().map((q) => q[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const side = Math.max(x1 - x0, y1 - y0) + 2 * PAD;
  const vbX = (x0 + x1) / 2 - side / 2;
  const vbY = (y0 + y1) / 2 - side / 2;
  const paths = rings_.map((pts) => `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}Z`);
  return (
    <svg viewBox={`${vbX.toFixed(1)} ${vbY.toFixed(1)} ${side.toFixed(1)} ${side.toFixed(1)}`} fill="none" stroke="currentColor" strokeWidth={1} aria-hidden focusable="false" data-slot="hill-contour-art" className={className}>
      {paths.map((d, i) => (
        <path key={i} d={d} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      ))}
    </svg>
  );
}
