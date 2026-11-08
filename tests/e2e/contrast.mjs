/**
 * Worst-case contrast of rendered text over photography (Chromium, 1× DPR).
 *
 * axe cannot evaluate text over images (it reports "incomplete"), so this
 * measures what the browser actually composites, region by region:
 *
 *   1. Normal capture N — the page as users see it.
 *   2. Mask capture M — same element with its text forced to opaque magenta
 *      (no shadow, opacity 1), giving the exact glyph shapes at this crop.
 *   3. Background capture B — same element with its text transparent but
 *      everything else kept: photo crop, gradient, shades, fills, borders,
 *      element opacity, and text-shadow halos (a halo is part of the text's
 *      background per WCAG's Understanding 1.4.3).
 *
 *   Foreground  = pixels of N inside the glyph cores (M is fully magenta),
 *                 i.e. the real composited text color, including any opacity
 *                 or transparency, over whatever is beneath it.
 *   Background  = pixels of B outside the glyphs, excluding a 1px
 *                 anti-aliasing fringe.
 *
 * The element box is divided into square cells about half the font size
 * (clamped 12–64px). Each cell containing both text and background is scored
 * conservatively: the median foreground luminance against the *worst 5%* of
 * that cell's background pixels (the 5th-percentile contrast). The element's
 * result is its worst cell — so a single region where letters cross a bright
 * cloud fails the element, even if the text is legible elsewhere.
 *
 * Overlays the visitor can scroll away from — the sticky header and the
 * floating Questions button (`[data-overlay]`) — are hidden while capturing, and
 * the target is centered in the viewport, so neither is measured as "text
 * background" (Round 2). Nothing in the measured element itself changes.
 *
 * Limitations (documented in the Work Item): one browser and one rendering of
 * each crop; photographs shift with viewport width, so results hold for the
 * widths measured; the 5th percentile tolerates isolated specks smaller than
 * 5% of a cell; WCAG contrast is defined for solid colors, so this is a
 * conservative application of the formula to photographic backgrounds,
 * supplementing (not replacing) visual review.
 */

/** @param {import("@playwright/test").Page} page @param {import("@playwright/test").Locator} target */
export async function measureTextContrast(page, target) {
  await page.addStyleTag({
    content: `*, *::before, *::after { transition: none !important; animation: none !important; }
      body > header, [data-overlay] { visibility: hidden !important; }
      [data-cmask], [data-cmask] * { color: #ff00ff !important; -webkit-text-fill-color: #ff00ff !important; text-shadow: none !important; }
      [data-cmask] { opacity: 1 !important; }
      [data-cbg], [data-cbg] * { color: transparent !important; -webkit-text-fill-color: transparent !important; }`,
  });
  // Scroll only after transitions are off, then wait until the element's box is
  // stable (the sticky header may change height a frame or two later, shifting
  // content; slower machines need more frames). The three captures must align.
  await target.evaluate((el) => el.scrollIntoView({ block: "center" }));
  const settle = () =>
    target.evaluate(
      (el) =>
        new Promise((resolve) => {
          let last = "", same = 0, frames = 0;
          const tick = () => {
            const r = el.getBoundingClientRect();
            const key = `${r.x},${r.y},${r.width},${r.height}`;
            same = key === last ? same + 1 : 0;
            last = key;
            if (same >= 3 || ++frames > 120) resolve(key);
            else requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }),
    );
  // Inline !important beats any stylesheet rule, whatever its specificity.
  const shoot = async (attr, clip) => {
    if (attr)
      await target.evaluate((el, a) => {
        el.setAttribute(a, "");
        el.dataset.cstyle = el.getAttribute("style") ?? "";
        if (a === "data-cmask") el.style.setProperty("opacity", "1", "important");
      }, attr);
    const png = await page.screenshot({ clip });
    if (attr)
      await target.evaluate((el, a) => {
        el.removeAttribute(a);
        el.setAttribute("style", el.dataset.cstyle ?? "");
        delete el.dataset.cstyle;
      }, attr);
    return png.toString("base64");
  };
  let normal, mask, background;
  for (let attempt = 0; ; attempt++) {
    const before = await settle();
    const box = await target.boundingBox();
    if (!box) throw new Error("element not visible");
    const clip = { x: Math.floor(box.x), y: Math.floor(box.y), width: Math.ceil(box.width), height: Math.ceil(box.height) };
    normal = await shoot(null, clip);
    mask = await shoot("data-cmask", clip);
    background = await shoot("data-cbg", clip);
    // If the layout moved during the captures, they don't line up: take them again.
    if ((await settle()) === before || attempt >= 2) break;
  }
  const fontSize = parseFloat(await target.evaluate((el) => getComputedStyle(el).fontSize));

  return page.evaluate(
    async ({ normal, mask, background, fontSize }) => {
      const decode = async (b64) => {
        const img = await new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = `data:image/png;base64,${b64}`; });
        const c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        const x = c.getContext("2d");
        x.drawImage(img, 0, 0);
        return { w: c.width, h: c.height, d: x.getImageData(0, 0, c.width, c.height).data };
      };
      const [N, M, B] = await Promise.all([decode(normal), decode(mask), decode(background)]);
      const { w, h } = N;
      const lin = (v) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      const lum = (d, i) => 0.2126 * lin(d[i]) + 0.7152 * lin(d[i + 1]) + 0.0722 * lin(d[i + 2]);
      const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

      const core = new Uint8Array(w * h); // fully covered glyph pixels
      const any = new Uint8Array(w * h); // any glyph coverage (incl. anti-aliasing)
      for (let p = 0, i = 0; p < w * h; p++, i += 4) {
        const dm = Math.abs(M.d[i] - 255) + M.d[i + 1] + Math.abs(M.d[i + 2] - 255);
        const db = Math.abs(M.d[i] - B.d[i]) + Math.abs(M.d[i + 1] - B.d[i + 1]) + Math.abs(M.d[i + 2] - B.d[i + 2]);
        if (dm < 24) core[p] = 1;
        if (db > 12) any[p] = 1;
      }
      const fringe = new Uint8Array(w * h); // glyphs dilated by 1px
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          if (!any[y * w + x]) continue;
          for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++) {
              const yy = y + dy, xx = x + dx;
              if (yy >= 0 && yy < h && xx >= 0 && xx < w) fringe[yy * w + xx] = 1;
            }
        }

      const cell = Math.min(64, Math.max(12, Math.round(fontSize / 2)));
      const cells = [];
      for (let cy = 0; cy < h; cy += cell)
        for (let cx = 0; cx < w; cx += cell) {
          const fg = [];
          const bg = [];
          for (let y = cy; y < Math.min(cy + cell, h); y++)
            for (let x = cx; x < Math.min(cx + cell, w); x++) {
              const p = y * w + x;
              if (core[p]) fg.push(lum(N.d, p * 4));
              else if (!fringe[p]) bg.push(lum(B.d, p * 4));
            }
          if (fg.length < 12 || bg.length < 12) continue;
          fg.sort((a, b) => a - b);
          const fgL = fg[Math.floor(fg.length / 2)];
          const rs = bg.map((b) => ratio(fgL, b)).sort((a, b) => a - b);
          cells.push({ x: cx, y: cy, ratio: rs[Math.floor(rs.length * 0.05)], fgL, bgL: bg.sort((a, b) => a - b)[Math.floor(bg.length * 0.95)] });
        }
      cells.sort((a, b) => a.ratio - b.ratio);
      const r2 = (n) => Math.round(n * 100) / 100;
      return {
        cellSize: cell,
        cells: cells.length,
        worst: cells.length ? r2(cells[0].ratio) : NaN,
        p10: cells.length ? r2(cells[Math.floor(cells.length * 0.1)].ratio) : NaN,
        median: cells.length ? r2(cells[Math.floor(cells.length / 2)].ratio) : NaN,
        worstCell: cells[0] ? { x: cells[0].x, y: cells[0].y, fgL: r2(cells[0].fgL), bgL: r2(cells[0].bgL) } : null,
      };
    },
    { normal, mask, background, fontSize },
  );
}
