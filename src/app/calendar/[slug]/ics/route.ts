import type { NextRequest } from "next/server";
import { icsFilename, occurrenceIcs, seriesIcs } from "@/lib/ics";
import { isIsoDate } from "@/lib/calendar";
import { OFFICIAL_RUNS_ON_HOLD } from "@/lib/permit-hold";
import { getRun } from "@/lib/runs";

/**
 * Calendar download for a run.
 *   ?scope=occurrence&date=YYYY-MM-DD   just that date (reflects overrides)
 *   ?scope=series                       the weekly series (weekly runs only)
 * A plain link with no JavaScript. Nothing is stored; the file is a snapshot.
 */
export async function GET(request: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  // Permit-pending hold: no calendar files for runs that are not official yet.
  if (OFFICIAL_RUNS_ON_HOLD) return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  const { slug } = await ctx.params;
  const run = getRun(slug);
  if (!run || run.status === "placeholder") return new Response("Not found", { status: 404 });
  const q = request.nextUrl.searchParams;
  const opts = { now: new Date(), siteUrl: request.nextUrl.origin };

  let body: string | null = null;
  let name = icsFilename(run);
  if (q.get("scope") === "series") {
    body = seriesIcs(run, opts);
  } else {
    const date = q.get("date");
    if (isIsoDate(date)) {
      body = occurrenceIcs(run, date, opts);
      name = icsFilename(run, date);
    }
  }
  if (!body) return new Response("Not found", { status: 404 });
  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}
