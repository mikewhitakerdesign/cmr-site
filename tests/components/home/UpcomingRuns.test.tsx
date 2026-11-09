import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UpcomingRuns } from "@/components/home/UpcomingRuns";
import { getNextOccurrencePerRun, getUpcomingRuns, runs, type Run } from "@/lib/runs";
import { axeViolations } from "../../axe";

const now = new Date("2026-11-09T18:00:00Z"); // Monday noon in Chicago

describe("UpcomingRuns", () => {
  it("lists the Round 2 two-run schedule, one row per run, soonest first", () => {
    render(<UpcomingRuns held={false} occurrences={getNextOccurrencePerRun(now)} now={now} />);
    expect(screen.getByRole("heading", { level: 2, name: "See you on the hill." })).toBeInTheDocument();
    const items = screen.getAllByRole("listitem");
    expect(items.map((li) => within(li).getByRole("heading", { level: 3 }).textContent)).toEqual([
      "Horner Hell Repeats",
      "Cricket Mtn Repeats",
    ]);
    const [horner, cricket] = items;
    expect(within(horner).getByText("WED · 5:30 AM")).toHaveAttribute("datetime", "2026-11-11T05:30-06:00");
    expect(within(horner).getByText("Horner Park")).toBeInTheDocument();
    expect(within(horner).getByText("Hill repeats · ~60 min")).toBeInTheDocument();
    expect(within(cricket).getByText("SAT · 5:30 AM")).toHaveAttribute("datetime", "2026-11-14T05:30-06:00");
    expect(within(cricket).getByText("Cricket Hill · Montrose Beach")).toBeInTheDocument();
    expect(within(cricket).getByText("Hill repeats · ~2 hrs")).toBeInTheDocument();
    expect(screen.queryByText(/Schiller/)).not.toBeInTheDocument();
  });

  it("describes each workout without inventing paces, and says the details are unconfirmed", () => {
    render(<UpcomingRuns held={false} occurrences={getNextOccurrencePerRun(now)} now={now} />);
    for (const li of screen.getAllByRole("listitem")) {
      const run = runs.find((r) => r.title === within(li).getByRole("heading").textContent)!;
      expect(within(li).getByText(run.description)).toBeInTheDocument();
      expect(run.description).toMatch(/to be confirmed/);
      expect(run.description).not.toMatch(/\d+:\d+ ?\/ ?(mi|km)|min\/mile|pace of/i);
    }
  });

  it("links each run name to its detail route, and the section to the calendar", () => {
    render(<UpcomingRuns held={false} occurrences={getNextOccurrencePerRun(now)} now={now} />);
    expect(screen.getByRole("link", { name: "Cricket Mtn Repeats" })).toHaveAttribute("href", "/calendar/cricket-mtn-repeats");
    expect(screen.getByRole("link", { name: "Horner Hell Repeats" })).toHaveAttribute("href", "/calendar/horner-hell-repeats");
    expect(screen.getByRole("link", { name: "See the full schedule" })).toHaveAttribute("href", "/calendar");
  });

  it("puts the schedule link after the runs in reading order", () => {
    render(<UpcomingRuns held={false} occurrences={getNextOccurrencePerRun(now)} now={now} />);
    const names = screen.getAllByRole("link").map((l) => l.textContent);
    expect(names.at(-1)).toBe("See the full schedule");
  });

  it("shows no visible sample badge but keeps each run's content status on the row", () => {
    render(<UpcomingRuns held={false} occurrences={getNextOccurrencePerRun(now)} now={now} />);
    expect(screen.queryByText(/Sample|unconfirmed/)).not.toBeInTheDocument();
    for (const li of screen.getAllByRole("listitem")) expect(li).toHaveAttribute("data-status", "provisional");
  });

  it("never lists scaffold placeholder runs", () => {
    render(<UpcomingRuns held={false} occurrences={getUpcomingRuns(new Date("2026-09-01T12:00:00Z"), 10)} now={now} />);
    expect(screen.queryByText("Example Hill Repeats")).not.toBeInTheDocument();
  });

  it("reflects a cancellation and an override from the data, still one row per run", () => {
    const edited: Run[] = runs.map((r) =>
      r.slug === "horner-hell-repeats" && r.schedule.kind === "weekly"
        ? { ...r, schedule: { ...r.schedule, cancellations: [{ date: "2026-11-11" }] } }
        : r.slug === "cricket-mtn-repeats" && r.schedule.kind === "weekly"
          ? { ...r, schedule: { ...r.schedule, overrides: [{ date: "2026-11-14", time: "06:00", note: "Late start" }] } }
          : r,
    );
    render(<UpcomingRuns held={false} occurrences={getNextOccurrencePerRun(now, edited)} now={now} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByRole("heading").textContent).toBe("Cricket Mtn Repeats");
    expect(within(items[0]).getByText("SAT · 6:00 AM")).toBeInTheDocument();
    expect(within(items[0]).getByText("Late start")).toBeInTheDocument();
    expect(within(items[1]).getByRole("heading").textContent).toBe("Horner Hell Repeats");
    expect(within(items[1]).getByText("NOV 18 · 5:30 AM")).toBeInTheDocument();
  });

  it("has an honest empty state that keeps the section and the calendar link", () => {
    render(<UpcomingRuns held={false} occurrences={[]} now={now} />);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.getByText(/No runs on the calendar right now/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See the full schedule" })).toHaveAttribute("href", "/calendar");
  });

  it("has no axe violations", async () => {
    const { container } = render(<UpcomingRuns held={false} occurrences={getNextOccurrencePerRun(now)} now={now} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
