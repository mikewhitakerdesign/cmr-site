import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UpcomingList } from "@/components/calendar/UpcomingList";
import { getUpcomingWithStatus, runs, type Run } from "@/lib/runs";
import { axeViolations } from "../../axe";

const now = new Date("2026-11-09T18:00:00Z");

describe("UpcomingList", () => {
  it("shows the real next date, time, place, duration, description and a details link", () => {
    render(<UpcomingList rows={getUpcomingWithStatus(now)} />);
    expect(screen.getByRole("heading", { level: 2, name: "See you on the hill." })).toBeInTheDocument();
    const items = screen.getAllByRole("listitem");
    expect(items.map((li) => within(li).getByRole("heading", { level: 3 }).textContent)).toEqual(["Horner Hell Repeats", "Cricket Mtn Repeats"]);
    const cricket = items[1];
    expect(within(cricket).getByText("Sat, Nov 14")).toBeInTheDocument();
    expect(within(cricket).getByText("5:30 AM").closest("time")).toHaveAttribute("datetime", "2026-11-14T05:30-06:00");
    expect(within(cricket).getByText("Cricket Hill · Montrose Beach")).toBeInTheDocument();
    expect(within(cricket).getByText("~2 hrs")).toBeInTheDocument();
    expect(within(cricket).getByRole("link", { name: "Cricket Mtn Repeats" })).toHaveAttribute("href", "/calendar/cricket-mtn-repeats");
    expect(cricket).toHaveAttribute("data-status", "provisional");
    expect(screen.queryByText(/Example Hill/)).toBeNull();
  });

  it("keeps a cancellation visible with the next real run, not as a normal upcoming event", () => {
    const patched: Run[] = runs.map((r) =>
      r.slug === "horner-hell-repeats" && r.schedule.kind === "weekly"
        ? { ...r, schedule: { ...r.schedule, cancellations: [{ date: "2026-11-11", note: "Closed for an event" }] } }
        : r,
    );
    render(<UpcomingList rows={getUpcomingWithStatus(now, patched)} />);
    const horner = screen.getAllByRole("listitem")[0];
    expect(horner).toHaveAttribute("data-occurrence-status", "cancelled");
    expect(within(horner).getByText("Cancelled")).toBeInTheDocument();
    expect(within(horner).getByText("Closed for an event")).toBeInTheDocument();
    expect(within(horner).getByText("Next run: Wed, Nov 18 · 5:30 AM.")).toBeInTheDocument();
  });

  it("labels a changed time", () => {
    const patched: Run[] = runs.map((r) =>
      r.slug === "cricket-mtn-repeats" && r.schedule.kind === "weekly"
        ? { ...r, schedule: { ...r.schedule, overrides: [{ date: "2026-11-14", time: "07:00" }] } }
        : r,
    );
    render(<UpcomingList rows={getUpcomingWithStatus(now, patched)} />);
    expect(screen.getByText("Time changed")).toBeInTheDocument();
    expect(screen.getByText("7:00 AM")).toBeInTheDocument();
  });

  it("has an honest empty state", () => {
    render(<UpcomingList rows={[]} />);
    expect(screen.getByText("No upcoming runs are scheduled right now. Check back soon.")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<UpcomingList rows={getUpcomingWithStatus(now)} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
