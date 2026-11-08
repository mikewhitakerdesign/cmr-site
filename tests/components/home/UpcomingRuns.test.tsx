import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UpcomingRuns } from "@/components/home/UpcomingRuns";
import { getUpcomingRuns, runs, type Run } from "@/lib/runs";
import { axeViolations } from "../../axe";

const now = new Date("2026-11-09T18:00:00Z"); // Monday noon in Chicago

describe("UpcomingRuns", () => {
  it("lists the next runs chronologically with slot, place and workout", () => {
    render(<UpcomingRuns occurrences={getUpcomingRuns(now, 3)} now={now} />);
    expect(screen.getByRole("heading", { level: 2, name: "See you on the hill." })).toBeInTheDocument();
    const items = screen.getAllByRole("listitem");
    expect(items.map((li) => within(li).getByRole("heading", { level: 3 }).textContent)).toEqual([
      "Cricket Mtn Repeats",
      "Horner Hell Repeats",
      "Schiller Quad Killer",
    ]);
    const [cricket, , schiller] = items;
    expect(within(cricket).getByText("TUE · 5:30 AM")).toHaveAttribute("datetime", "2026-11-10T05:30-06:00");
    expect(within(cricket).getByText("Cricket Hill · Montrose Beach")).toBeInTheDocument();
    expect(within(cricket).getByText("Hill Repeats · ~60 min")).toBeInTheDocument();
    expect(within(schiller).getByText("SAT · 5:00 AM")).toBeInTheDocument();
    expect(within(schiller).getByText("XC miles + Hill repeats · ~3 hrs")).toBeInTheDocument();
  });

  it("links each run name to its detail route, and the section to the calendar", () => {
    render(<UpcomingRuns occurrences={getUpcomingRuns(now, 3)} now={now} />);
    expect(screen.getByRole("link", { name: "Cricket Mtn Repeats" })).toHaveAttribute("href", "/calendar/cricket-mtn-repeats");
    expect(screen.getByRole("link", { name: "Horner Hell Repeats" })).toHaveAttribute("href", "/calendar/horner-hell-repeats");
    expect(screen.getByRole("link", { name: "Schiller Quad Killer" })).toHaveAttribute("href", "/calendar/schiller-quad-killer");
    expect(screen.getByRole("link", { name: "See the full schedule" })).toHaveAttribute("href", "/calendar");
  });

  it("puts the schedule link after the runs in reading order", () => {
    render(<UpcomingRuns occurrences={getUpcomingRuns(now, 3)} now={now} />);
    const names = screen.getAllByRole("link").map((l) => l.textContent);
    expect(names.at(-1)).toBe("See the full schedule");
  });

  it("marks a provisional schedule, and not a verified one", () => {
    const { rerender } = render(<UpcomingRuns occurrences={getUpcomingRuns(now, 3)} now={now} />);
    expect(screen.getByText("Sample schedule · unconfirmed")).toBeInTheDocument();
    const verified: Run[] = runs.map((r) => ({ ...r, status: r.status === "placeholder" ? r.status : "verified" }));
    rerender(<UpcomingRuns occurrences={getUpcomingRuns(now, 3, verified)} now={now} />);
    expect(screen.queryByText(/Sample schedule/)).not.toBeInTheDocument();
  });

  it("never lists scaffold placeholder runs", () => {
    render(<UpcomingRuns occurrences={getUpcomingRuns(new Date("2026-09-01T12:00:00Z"), 10)} now={now} />);
    expect(screen.queryByText("Example Hill Repeats")).not.toBeInTheDocument();
  });

  it("reflects a cancellation and an override from the data", () => {
    const edited: Run[] = runs.map((r) =>
      r.slug === "cricket-mtn-repeats" && r.schedule.kind === "weekly"
        ? { ...r, schedule: { ...r.schedule, cancellations: [{ date: "2026-11-10" }] } }
        : r.slug === "horner-hell-repeats" && r.schedule.kind === "weekly"
          ? { ...r, schedule: { ...r.schedule, overrides: [{ date: "2026-11-13", time: "06:00", note: "Late start" }] } }
          : r,
    );
    render(<UpcomingRuns occurrences={getUpcomingRuns(now, 3, edited)} now={now} />);
    const items = screen.getAllByRole("listitem");
    expect(within(items[0]).getByText("FRI · 6:00 AM")).toBeInTheDocument();
    expect(within(items[0]).getByText("Late start")).toBeInTheDocument();
    expect(within(items[2]).getByRole("heading").textContent).toBe("Cricket Mtn Repeats");
    expect(within(items[2]).getByText("NOV 17 · 5:30 AM")).toBeInTheDocument();
  });

  it("has an honest empty state that keeps the section and the calendar link", () => {
    render(<UpcomingRuns occurrences={[]} now={now} />);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.getByText(/No runs on the calendar right now/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See the full schedule" })).toHaveAttribute("href", "/calendar");
    expect(screen.queryByText(/Sample schedule/)).not.toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<UpcomingRuns occurrences={getUpcomingRuns(now, 3)} now={now} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
