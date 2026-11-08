import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QuestionsWidget, validateQuestion } from "@/components/QuestionsWidget";
import { QUESTIONS_FORM_ID } from "@/lib/questions";
import { axeViolations } from "../axe";

/**
 * Formspree is never contacted: `fetch` is replaced in every test, and any
 * unexpected call fails loudly. A real delivery test needs Owner authorization.
 */
let fetchMock: ReturnType<typeof vi.fn>;
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

beforeEach(() => {
  fetchMock = vi.fn(() => Promise.reject(new Error("unexpected network call")));
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

async function openPanel() {
  const user = userEvent.setup();
  render(<QuestionsWidget />);
  await user.click(screen.getByRole("button", { name: "Questions?" }));
  return { user, dialog: screen.getByRole("dialog", { name: "Questions about the club?" }) };
}

async function fill(user: ReturnType<typeof userEvent.setup>, dialog: HTMLElement, v: { q?: string; email?: string; name?: string }) {
  if (v.q) await user.type(within(dialog).getByLabelText("Your question"), v.q);
  if (v.email) await user.type(within(dialog).getByLabelText("Email"), v.email);
  if (v.name) await user.type(within(dialog).getByLabelText(/Name/), v.name);
}

describe("validateQuestion", () => {
  it("requires a question and a valid email", () => {
    expect(validateQuestion({ message: " ", email: "" })).toEqual({
      message: "Add your question.",
      email: "Add your email so we can reply.",
    });
    expect(validateQuestion({ message: "Hi", email: "nope" }).email).toMatch(/doesn't look right/);
    expect(validateQuestion({ message: "Hi", email: "runner@example.com" })).toEqual({});
  });
});

describe("QuestionsWidget", () => {
  it("is closed until the trigger opens it, then focuses the question field", async () => {
    render(<QuestionsWidget />);
    const trigger = screen.getByRole("button", { name: "Questions?" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(); // hidden
    await userEvent.setup().click(trigger);
    expect(screen.getByRole("button", { name: "Close" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByLabelText("Your question")).toHaveFocus();
  });

  it("closes with Escape or the close button, returns focus to the trigger, and keeps the draft", async () => {
    const { user, dialog } = await openPanel();
    await fill(user, dialog, { q: "Do I need trail shoes?" });
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const trigger = screen.getByRole("button", { name: "Questions?" });
    expect(trigger).toHaveFocus();
    await user.click(trigger);
    expect(screen.getByLabelText("Your question")).toHaveValue("Do I need trail shoes?");
    await user.click(screen.getByRole("button", { name: "Close questions" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Questions?" })).toHaveFocus();
  });

  it("labels every field and marks Name optional", async () => {
    const { dialog } = await openPanel();
    expect(within(dialog).getByLabelText("Your question")).toHaveAttribute("name", "message");
    expect(within(dialog).getByLabelText("Email")).toHaveAttribute("name", "email");
    expect(within(dialog).getByLabelText("Name (optional)")).toHaveAttribute("name", "name");
  });

  it("shows linked field errors and focuses the first invalid field, without sending", async () => {
    const { user, dialog } = await openPanel();
    await user.click(within(dialog).getByRole("button", { name: "Send question" }));
    const question = within(dialog).getByLabelText("Your question");
    expect(question).toHaveAttribute("aria-invalid", "true");
    expect(question).toHaveAccessibleDescription("Add your question.");
    expect(question).toHaveFocus();
    await fill(user, dialog, { q: "Is it really free?", email: "not-an-email" });
    await user.click(within(dialog).getByRole("button", { name: "Send question" }));
    const email = within(dialog).getByLabelText("Email");
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAccessibleDescription(/So we can reply\. That email doesn't look right/);
    expect(email).toHaveFocus();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("disables the button while sending, then confirms only after Formspree succeeds", async () => {
    let resolve!: (r: Response) => void;
    fetchMock.mockImplementation(() => new Promise<Response>((r) => (resolve = r)));
    const { user, dialog } = await openPanel();
    await fill(user, dialog, { q: "What should I bring?", email: "runner@example.com", name: "Sam" });
    await user.click(within(dialog).getByRole("button", { name: "Send question" }));

    const sending = await within(dialog).findByRole("button", { name: "Sending…" });
    expect(sending).toBeDisabled();
    expect(screen.queryByText(/on its way/)).not.toBeInTheDocument();

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(`https://formspree.io/f/${QUESTIONS_FORM_ID}`);
    const body = init.body as FormData;
    expect(body.get("message")).toBe("What should I bring?");
    expect(body.get("email")).toBe("runner@example.com");
    expect(body.get("name")).toBe("Sam");

    resolve(json(200, { ok: true, next: "https://formspree.io/thanks" }));
    const done = await within(dialog).findByRole("status");
    expect(done).toHaveTextContent("Thanks — your question is on its way.");
    expect(done).toHaveTextContent("runner@example.com");
    await waitFor(() => expect(done).toHaveFocus());
  });

  it("shows Formspree's field errors on the field and keeps the form", async () => {
    fetchMock.mockResolvedValue(
      json(422, { errors: [{ field: "email", code: "TYPE_EMAIL", message: "should be an email" }] }),
    );
    const { user, dialog } = await openPanel();
    await fill(user, dialog, { q: "Hello?", email: "runner@example.com" });
    await user.click(within(dialog).getByRole("button", { name: "Send question" }));
    const email = within(dialog).getByLabelText("Email");
    await waitFor(() => expect(email).toHaveAttribute("aria-invalid", "true"));
    expect(email).toHaveAccessibleDescription(/should be an email/);
    expect(screen.queryByText(/on its way/)).not.toBeInTheDocument();
  });

  it("announces a delivery failure and never claims it was sent", async () => {
    fetchMock.mockResolvedValue(json(400, { errors: [{ code: "EMPTY", message: "Form submission failed." }] }));
    const { user, dialog } = await openPanel();
    await fill(user, dialog, { q: "Hello?", email: "runner@example.com" });
    await user.click(within(dialog).getByRole("button", { name: "Send question" }));
    const alert = await within(dialog).findByRole("alert");
    expect(alert).toHaveTextContent(/didn't send/);
    expect(within(dialog).getByRole("button", { name: "Send question" })).toBeEnabled();
    expect(screen.queryByText(/on its way/)).not.toBeInTheDocument();
  });

  it("includes Formspree's honeypot, hidden from people and assistive tech", async () => {
    const { dialog } = await openPanel();
    const trap = dialog.querySelector("input[name=_gotcha]")!;
    expect(trap).toHaveAttribute("aria-hidden");
    expect(trap).toHaveAttribute("tabindex", "-1");
  });

  it("has no axe violations open or closed", async () => {
    const { container } = render(<QuestionsWidget />);
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.setup().click(screen.getByRole("button", { name: "Questions?" }));
    expect(await axeViolations(container)).toEqual([]);
  });
});
