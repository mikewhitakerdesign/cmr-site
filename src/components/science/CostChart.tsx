/**
 * Physics figure: the four values for the energy cost of running that Minetti
 * et al. (2002) report in their abstract, plotted as points only. Nothing is
 * interpolated between them: the paper measured more slopes, but only these
 * four are quoted here, so drawing a curve would invent its shape.
 *
 * Server Component, monochrome. The table that follows the chart carries the
 * same values for screen readers and anyone who prefers numbers.
 */
const POINTS = [
  { grade: -45, cost: 3.92, label: "3.9" },
  { grade: -20, cost: 1.73, label: "1.7" },
  { grade: 0, cost: 3.4, label: "3.4" },
  { grade: 45, cost: 18.93, label: "18.9" },
] as const;

export function CostChart() {
  // Plot area
  const left = 64;
  const right = 600;
  const top = 24;
  const bottom = 284;
  const x = (g: number) => left + ((g + 50) / 100) * (right - left);
  const y = (c: number) => bottom - (c / 20) * (bottom - top);

  return (
    <div data-slot="cost-chart" className="max-w-[680px]">
      <svg viewBox="0 0 640 340" aria-hidden className="w-full text-foreground">
        {/* Gridlines and y ticks */}
        {[0, 5, 10, 15, 20].map((c) => (
          <g key={c}>
            <line x1={left} x2={right} y1={y(c)} y2={y(c)} stroke="currentColor" strokeOpacity={c === 0 ? 0.6 : 0.12} />
            <text x={left - 12} y={y(c) + 6} textAnchor="end" className="fill-current font-mono text-[16px]" fillOpacity={0.65}>
              {c}
            </text>
          </g>
        ))}
        {/* Level-ground marker */}
        <line x1={x(0)} x2={x(0)} y1={top} y2={bottom} stroke="currentColor" strokeOpacity={0.3} strokeDasharray="3 5" />
        {/* x ticks */}
        {[-40, -20, 0, 20, 40].map((g) => (
          <text key={g} x={x(g)} y={bottom + 26} textAnchor="middle" className="fill-current font-mono text-[16px]" fillOpacity={0.65}>
            {g > 0 ? `+${g}` : g === 0 ? "0" : `−${Math.abs(g)}`}%
          </text>
        ))}
        <text x={(left + right) / 2} y={bottom + 52} textAnchor="middle" className="fill-current text-[16px]" fillOpacity={0.75}>
          Gradient (downhill ← → uphill)
        </text>
        {/* Points */}
        {POINTS.map((p) => (
          <g key={p.grade}>
            <circle cx={x(p.grade)} cy={y(p.cost)} r={6} className="fill-current" />
            <text
              x={x(p.grade) + (p.grade === 45 ? -14 : 12)}
              y={y(p.cost) - 12}
              textAnchor={p.grade === 45 ? "end" : "start"}
              className="fill-current text-[17px] font-semibold"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
      <table className="mt-4 w-full text-left text-p-sm">
        <caption className="sr-only">Energy cost of running by gradient, Minetti et al. 2002</caption>
        <thead>
          <tr className="border-b border-foreground/15 font-mono text-[12px] tracking-[0.08em] text-foreground/65 uppercase">
            <th scope="col" className="py-2 font-normal">
              Gradient
            </th>
            {POINTS.map((p) => (
              <th key={p.grade} scope="col" className="py-2 text-right font-normal">
                {p.grade > 0 ? `+${p.grade}` : p.grade === 0 ? "0" : `−${Math.abs(p.grade)}`}%
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row" className="py-2 font-normal text-foreground/80">
              J per kg per m
            </th>
            {POINTS.map((p) => (
              <td key={p.grade} className="py-2 text-right font-semibold tabular-nums">
                {p.label}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
