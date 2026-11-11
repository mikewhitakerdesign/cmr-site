import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HillsOnPause } from "@/components/calendar/HillsOnPause";
import { QuestionsWidget } from "@/components/QuestionsWidget";
import { QUESTIONS_FORM_ID } from "@/lib/questions";
import { axeViolations } from "../axe";

/**
 * The centered Questions dialog opened from "send us your questions" on /calendar. The form is the same
 * QuestionsPanel the floating widget renders (its own tests cover validation, errors and the success
 * state); these check what the dialog adds. jsdom has no <dialog>.showModal(), so it is polyfilled here;
 * the real top layer, focus trap, Escape and backdrop are asserted in tests/e2e/questions-dialog.spec.ts.
 * Formspree is never contacted: `fetch` is replaced.
 */
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn(() => Promise.reject(new Error("unexpected network call")));
  vi.stubGlobal("fetch", fetchMock);
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close() {
    if (!this.hasAttribute("open")) return;
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});
afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute("style");
});

const trigger = () => screen.getByRole("button", { name: "send us your questions" });
const dialogEl = () => document.querySelector("dialog")!;

async function openDialog() {
  const user = userEvent.setup();
  render(<HillsOnPause />);
  await user.click(trigger());
  return { user, dialog: screen.getByRole("dialog", { name: "Questions about the club?" }) };
}

describe("Questions dialog", () => {
  it("is closed until the link is used, then opens modally with the question field focused", async () => {
    render(<HillsOnPause />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(dialogEl()).not.toHaveAttribute("open");
    await userEvent.setup().click(trigger());
    const dialog = screen.getByRole("dialog", { name: "Questions about the club?" });
    expect(dialog).toHaveAccessibleDescription(/Ask away/);
    expect(within(dialog).getByLabelText("Your question")).toHaveFocus();
  });

  it("closes with the close button and returns focus to the link", async () => {
    const { user } = await openDialog();
    await user.click(screen.getByRole("button", { name: "Close questions" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
  });

  it("closes when the platform closes it (Escape fires the native close event) and returns focus", async () => {
    await openDialog();
    dialogEl().close();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger()).toHaveFocus();
  });

  it("closes on a click on the backdrop, not on a click inside the panel or a drag that ends on it", async () => {
    const { user, dialog } = await openDialog();
    await user.click(within(dialog).getByLabelText("Your question"));
    await user.click(within(dialog).getByRole("heading", { name: "Questions about the club?" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.mouseDown(within(dialog).getByLabelText("Your question")); // press starts inside…
    fireEvent.click(dialog); // …and ends on the backdrop: stays open
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.mouseDown(dialog);
    fireEvent.click(dialog);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger()).toHaveFocus();
  });

  it("locks background scrolling while open and restores it on close", async () => {
    const root = document.documentElement;
    root.style.overflow = "scroll";
    const { user } = await openDialog();
    expect(root.style.overflow).toBe("hidden");
    await user.click(screen.getByRole("button", { name: "Close questions" }));
    expect(root.style.overflow).toBe("scroll");
  });

  it("keeps a draft when closed and reopened", async () => {
    const { user, dialog } = await openDialog();
    await user.type(within(dialog).getByLabelText("Your question"), "Do I need trail shoes?");
    await user.click(screen.getByRole("button", { name: "Close questions" }));
    await user.click(trigger());
    expect(screen.getByLabelText("Your question")).toHaveValue("Do I need trail shoes?");
  });

  it("sends through the same Formspree form as the floating panel, and confirms only on success", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true, next: "https://formspree.io/thanks" }), { status: 200, headers: { "Content-Type": "application/json" } }));
    const { user, dialog } = await openDialog();
    await user.click(within(dialog).getByRole("button", { name: "Send question" })); // validation first
    expect(within(dialog).getByLabelText("Your question")).toHaveAttribute("aria-invalid", "true");
    expect(fetchMock).not.toHaveBeenCalled();

    await user.type(within(dialog).getByLabelText("Your question"), "Where do we meet?");
    await user.type(within(dialog).getByLabelText("Email"), "runner@example.com");
    await user.click(within(dialog).getByRole("button", { name: "Send question" }));
    expect(String(fetchMock.mock.calls[0][0])).toBe(`https://formspree.io/f/${QUESTIONS_FORM_ID}`);
    expect(await within(dialog).findByRole("status")).toHaveTextContent("Thanks, your question is on its way.");
  });

  it("has no axe violations closed or open", async () => {
    const { container } = render(<HillsOnPause />);
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.setup().click(trigger());
    expect(await axeViolations(document.body)).toEqual([]);
  });

  it("leaves the floating Questions panel untouched alongside it", async () => {
    const user = userEvent.setup();
    render(
      <>
        <HillsOnPause />
        <QuestionsWidget />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Questions?" }));
    const panel = screen.getByRole("dialog", { name: "Questions about the club?" }); // only the widget's panel is open
    expect(within(panel).getByLabelText("Your question")).toHaveFocus();
    expect(dialogEl()).not.toHaveAttribute("open");
    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "Questions?" })).toHaveFocus();
  });
});
