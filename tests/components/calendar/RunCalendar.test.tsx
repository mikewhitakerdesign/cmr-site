import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { RunCalendar, calendarQuery, type CalendarRun } from "@/components/calendar/RunCalendar";
import { axeViolations } from "../../axe";

const TODAY = "2026-11-09";
const runs: CalendarRun[] = [
  { slug: "cricket-mtn-repeats", title: "Cricket Mtn Repeats", meetupLocation: "Cricket Hill · Montrose Beach", durationLabel: "~2 hrs", description: "d1", status: "provisional",
    schedule: { kind: "weekly", weekday: "SAT", time: "05:30", cancellations: [{ date: "2026-11-21", note: "Course closed" }], overrides: [{ date: "2026-11-28", time: "07:00" }] } },
  { slug: "horner-hell-repeats", title: "Horner Hell Repeats", meetupLocation: "Horner Park", durationLabel: "~60 min", description: "d2", status: "provisional",
    schedule: { kind: "weekly", weekday: "WED", time: "05:30" } },
];
const setup = (view: "month" | "week" = "month", date = TODAY) => render(<RunCalendar runs={runs} today={TODAY} initialView={view} initialDate={date} />);
const table = () => screen.getByRole("table", { hidden: true });

describe("RunCalendar", () => {
  it("shows the month grid with weekly runs on their dates and none before today", () => {
    setup();
    expect(screen.getByRole("heading", { level: 3, name: "November 2026" })).toBeInTheDocument();
    const grid = within(table());
    expect(grid.getAllByText("Cricket Mtn Repeats").length).toBe(4); // Nov 14, 21 (cancelled), 28, Dec 5
    const nov4 = table().querySelector('td[data-date="2026-11-04"]')!;
    expect(within(nov4 as HTMLElement).queryByText("Horner Hell Repeats")).toBeNull();
    const nov11 = table().querySelector('td[data-date="2026-11-11"]')!;
    expect(within(nov11 as HTMLElement).getByText("Horner Hell Repeats")).toBeInTheDocument();
  });

  it("marks cancelled and changed occurrences", () => {
    setup();
    const cancelled = table().querySelector('td[data-date="2026-11-21"]') as HTMLElement;
    expect(within(cancelled).getByText("Cancelled")).toBeInTheDocument();
    const changed = table().querySelector('td[data-date="2026-11-28"]') as HTMLElement;
    expect(within(changed).getByText("Time changed")).toBeInTheDocument();
    expect(within(changed).getByText("7:00 AM")).toBeInTheDocument();
  });

  it("pages months, disables Previous at the current month, and Today returns", async () => {
    const user = userEvent.setup();
    setup();
    const prev = screen.getByRole("button", { name: "Previous month" });
    expect(prev).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByRole("heading", { level: 3, name: "December 2026" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous month" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Today" }));
    expect(screen.getByRole("heading", { level: 3, name: "November 2026" })).toBeInTheDocument();
  });

  it("switches to Week and pages by week", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: "week" }));
    expect(screen.getByRole("button", { name: "week" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { level: 3, name: "Nov 8 to 14, 2026" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next week" }));
    expect(screen.getByRole("heading", { level: 3, name: "Nov 15 to 21, 2026" })).toBeInTheDocument();
  });

  it("selects a date and an event and shows its details with a link", async () => {
    const user = userEvent.setup();
    setup();
    const nov14 = table().querySelector('td[data-date="2026-11-14"]') as HTMLElement;
    await user.click(within(nov14).getByRole("button", { name: /Cricket Mtn Repeats/ }));
    const panel = document.querySelector('[data-slot="selected-day"]') as HTMLElement;
    expect(within(panel).getByText("Saturday, November 14")).toBeInTheDocument();
    expect(within(panel).getByRole("link", { name: "Run details: Cricket Mtn Repeats" })).toHaveAttribute("href", "/calendar/cricket-mtn-repeats");
    await user.click(within(table()).getByRole("button", { name: /^Wednesday, November 11/ }));
    expect(within(panel).getByText("Horner Hell Repeats", { selector: "h4" })).toBeInTheDocument();
  });

  it("moves between dates with the arrow keys", async () => {
    const user = userEvent.setup();
    setup();
    const today = table().querySelector<HTMLElement>('[data-date-button="2026-11-09"]')!;
    today.focus();
    await user.keyboard("{ArrowRight}");
    expect(table().querySelector('[data-date-button="2026-11-10"]')).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(table().querySelector('[data-date-button="2026-11-17"]')).toHaveFocus();
  });

  it("starts from URL state", () => {
    setup("week", "2026-11-14");
    expect(screen.getByRole("heading", { level: 3, name: "Nov 8 to 14, 2026" })).toBeInTheDocument();
    expect(table().querySelector('td[data-date="2026-11-14"]')).toHaveAttribute("data-selected");
  });

  it("builds URL state, leaving the defaults out", () => {
    expect(calendarQuery("month", TODAY, TODAY)).toBe("");
    expect(calendarQuery("week", "2026-11-14", TODAY)).toBe("?view=week&date=2026-11-14");
  });

  it("renders a date-grouped agenda for phones with run links", () => {
    setup();
    const agenda = document.querySelector('[data-slot="agenda"]') as HTMLElement;
    const items = within(agenda).getAllByRole("listitem", { hidden: true }).filter((li) => li.hasAttribute("data-date"));
    expect(items[0]).toHaveAttribute("data-date", "2026-11-11");
    expect(within(agenda).getAllByRole("link", { name: /Run details/, hidden: true }).length).toBeGreaterThan(3);
  });

  it("says so when a period has no runs", () => {
    render(<RunCalendar runs={[]} today={TODAY} initialView="month" initialDate={TODAY} />);
    expect(screen.getByText("No runs are scheduled this month.")).toBeInTheDocument();
  });

  it("notes that details are provisional", () => {
    setup();
    expect(screen.getByText(/provisional until the club confirms/)).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = setup();
    expect(await axeViolations(container)).toEqual([]);
  });
});
