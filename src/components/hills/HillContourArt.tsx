/**
 * A decorative top-down contour drawing: nested, slightly irregular closed
 * rings in a black 1px line, different for each hill (seeded by the slug).
 * It is NOT measured terrain and is not built from the hill's elevation data;
 * it is artwork, hidden from assistive technology, and says so here so it is
 * never mistaken for a map.
 */
const seedFor = (slug: string) => [...slug].reduce((n, c) => (n * 31 + c.charCodeAt(0)) % 9973, 17);

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
  const paths = Array.from({ length: rings }, (_, k) => {
    const t = (k + 1) / rings; // outermost ring last
    const R = 14 + 104 * t;
    // Inner rings drift toward a summit offset, so the spacing is uneven like real contours.
    const cx = 120 + (1 - t) * 18 * Math.cos(p1);
    const cy = 120 + (1 - t) * 18 * Math.sin(p1);
    const pts = Array.from({ length: 72 }, (_, i) => {
      const th = (i / 72) * Math.PI * 2;
      const f = 1 + a2 * Math.sin(2 * th + p1) + a3 * Math.sin(3 * th + p2) + a4 * Math.sin(5 * th + p3);
      return `${(cx + R * f * Math.cos(th)).toFixed(1)} ${(cy + R * f * Math.sin(th)).toFixed(1)}`;
    });
    return `M${pts.join("L")}Z`;
  });
  return (
    <svg viewBox="0 0 240 240" fill="none" stroke="currentColor" strokeWidth={1} aria-hidden focusable="false" data-slot="hill-contour-art" className={className}>
      {paths.map((d, i) => (
        <path key={i} d={d} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      ))}
    </svg>
  );
}
