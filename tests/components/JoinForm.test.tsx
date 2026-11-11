import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { JoinForm } from "@/components/join/JoinForm";
import { JOIN_FORM_ID, validateJoin } from "@/lib/join";
import { OFFICIAL_RUNS_ON_HOLD } from "@/lib/permit-hold";
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

const setup = () => ({ user: userEvent.setup(), ...render(<JoinForm />) });
const submitButton = () => screen.getByRole("button", { name: /Count me in|Joining/ });
// The button is disabled until the form is ready; this is what Enter in a field (or a script) does.
const forceSubmit = (container: HTMLElement) => fireEvent.submit(container.querySelector("form")!);
async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("First name"), "Sam");
  await user.type(screen.getByLabelText("Email address"), "sam@example.com");
}

describe("validateJoin", () => {
  it("requires a first name and a valid email, and nothing about a waiver", () => {
    expect(validateJoin({ firstName: " ", email: "" })).toEqual({
      firstName: "Add your first name.",
      email: "Add your email address so we can send club updates.",
    });
    expect(validateJoin({ firstName: "Sam", email: "nope" }).email).toMatch(/doesn't look right/);
    expect(validateJoin({ firstName: "Sam", email: "sam@example.com" })).toEqual({});
  });
});

describe("JoinForm", () => {
  it("uses the Join endpoint, which is not the Questions endpoint", () => {
    expect(JOIN_FORM_ID).toBe("xrppvnln");
    expect(JOIN_FORM_ID).not.toBe(QUESTIONS_FORM_ID);
  });

  it("labels every field and marks them required, with no checkbox at all", () => {
    setup();
    expect(screen.getByLabelText("First name")).toHaveAttribute("name", "first_name");
    expect(screen.getByLabelText("First name")).toBeRequired();
    expect(screen.getByLabelText("Email address")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Email address")).toHaveAttribute("autocomplete", "email");
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("states the 18+ eligibility without a checkbox, and has no waiver link or wording (the waiver is disabled)", () => {
    const { container } = setup();
    expect(container).toHaveTextContent("By joining, you confirm that you are at least 18 years old.");
    expect(screen.queryByRole("link", { name: /waiver/i })).not.toBeInTheDocument();
    expect(container.textContent).not.toMatch(/waiver|release of liability|assumption of risk/i);
  });

  it("enables the button once the name and a valid email are in place", async () => {
    const { user } = setup();
    expect(submitButton()).toBeDisabled();
    await user.type(screen.getByLabelText("First name"), "Sam");
    expect(submitButton()).toBeDisabled();
    await user.type(screen.getByLabelText("Email address"), "not-an-email");
    expect(submitButton()).toBeDisabled();
    await user.clear(screen.getByLabelText("Email address"));
    await user.type(screen.getByLabelText("Email address"), "sam@example.com");
    expect(submitButton()).toBeEnabled();
  });

  it("explains that joining includes club emails with an unsubscribe option, and links to Privacy", () => {
    setup();
    const note = screen.getByText(/includes emails about club runs/);
    expect(note).toHaveTextContent(/unsubscribe at any time by contacting us through the Questions form/);
    expect(note).not.toHaveTextContent(/unsubscribe link|one-click/);
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy");
  });

  it("shows linked errors for every missing field, focuses the first, and sends nothing", async () => {
    const { container } = setup();
    forceSubmit(container);
    const first = screen.getByLabelText("First name");
    expect(first).toHaveAttribute("aria-invalid", "true");
    expect(first).toHaveAccessibleDescription("Add your first name.");
    expect(first).toHaveFocus();
    expect(screen.getByLabelText("Email address")).toHaveAccessibleDescription(/Add your email address/);
        expect(fetchMock).not.toHaveBeenCalled();
  });

  it("cannot be submitted with an invalid email, even by forcing the form", async () => {
    const { user, container } = setup();
    await user.type(screen.getByLabelText("First name"), "Sam");
    await user.type(screen.getByLabelText("Email address"), "not-an-email");
    forceSubmit(container);
    expect(screen.getByLabelText("Email address")).toHaveFocus();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends exactly once while sending, then confirms only after Formspree succeeds", async () => {
    let resolve!: (r: Response) => void;
    fetchMock.mockImplementation(() => new Promise<Response>((r) => (resolve = r)));
    const { user } = setup();
    await fillValid(user);
    await user.click(submitButton());

    const sending = await screen.findByRole("button", { name: "Joining…" });
    expect(sending).toBeDisabled();
    await user.click(sending);
    await user.keyboard("{Enter}");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("YOU'RE IN.")).not.toBeInTheDocument();

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(`https://formspree.io/f/${JOIN_FORM_ID}`);
    const body = init.body as FormData;
    expect(body.get("first_name")).toBe("Sam");
    expect(body.get("email")).toBe("sam@example.com");
    expect(body.get("age_18_plus")).toBe("yes");
    // No waiver fields: no agreement is obtained while the waiver is disabled.
    expect([...body.keys()].filter((k) => /waiver/i.test(k))).toEqual([]);
    expect(body.get("_subject")).toBe("CMR Join signup");

    resolve(json(200, { ok: true, next: "https://formspree.io/thanks" }));
    const done = await screen.findByRole("status");
    expect(done).toHaveTextContent("YOU'RE IN.");
    expect(done).toHaveTextContent("We've received your signup. You'll hear from us when there's something worth sharing.");
    expect(done).toHaveTextContent("In the meantime, there's a hill with your name on it.");
    await waitFor(() => expect(done).toHaveFocus());
    // Held: the Hills directory, never an unavailable event. Lifted: Find a Run.
    expect(screen.getByRole("link", { name: OFFICIAL_RUNS_ON_HOLD ? "Explore the hills" : "Find a Run" })).toHaveAttribute("href", OFFICIAL_RUNS_ON_HOLD ? "/hills" : "/calendar");
    expect(screen.queryByLabelText("Email address")).not.toBeInTheDocument();
    expect(done).not.toHaveTextContent("sam@example.com");
  });

  it("keeps what was typed and announces plainly when delivery fails, then allows another try", async () => {
    fetchMock.mockResolvedValueOnce(json(400, { errors: [{ code: "EMPTY", message: "Form submission failed." }] }));
    const { user } = setup();
    await fillValid(user);
    await user.click(submitButton());
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("We couldn't confirm your signup. Please try again. Your information is still here.");
    expect(screen.queryByText("YOU'RE IN.")).not.toBeInTheDocument();
    expect(screen.getByLabelText("First name")).toHaveValue("Sam");
    expect(screen.getByLabelText("Email address")).toHaveValue("sam@example.com");
    expect(submitButton()).toBeEnabled();

    fetchMock.mockResolvedValueOnce(json(200, { ok: true, next: "https://formspree.io/thanks" }));
    await user.click(submitButton());
    expect(await screen.findByText("YOU'RE IN.")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("treats a network failure as an error, never as success", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const { user } = setup();
    await fillValid(user);
    await user.click(submitButton());
    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn't confirm your signup/);
    expect(screen.queryByText("YOU'RE IN.")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toHaveValue("sam@example.com");
  });

  it("shows Formspree's field errors on the field and keeps the form", async () => {
    fetchMock.mockResolvedValue(json(422, { errors: [{ field: "email", code: "TYPE_EMAIL", message: "should be an email" }] }));
    const { user } = setup();
    await fillValid(user);
    await user.click(submitButton());
    const email = screen.getByLabelText("Email address");
    await waitFor(() => expect(email).toHaveAttribute("aria-invalid", "true"));
    expect(email).toHaveAccessibleDescription(/should be an email/);
    expect(screen.queryByText("YOU'RE IN.")).not.toBeInTheDocument();
  });

  it("includes Formspree's honeypot, hidden from people and assistive tech", () => {
    const { container } = setup();
    const trap = container.querySelector("input[name=_gotcha]")!;
    expect(trap).toHaveAttribute("aria-hidden");
    expect(trap).toHaveAttribute("tabindex", "-1");
  });

  it("has no axe violations idle, with errors, or after success", async () => {
    fetchMock.mockResolvedValue(json(200, { ok: true, next: "https://formspree.io/thanks" }));
    const { user, container } = setup();
    expect(await axeViolations(container)).toEqual([]);
    forceSubmit(container);
    expect(await axeViolations(container)).toEqual([]);
    await fillValid(user);
    await user.click(submitButton());
    await screen.findByText("YOU'RE IN.");
    expect(await axeViolations(container)).toEqual([]);
  });
});
