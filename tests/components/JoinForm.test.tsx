import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { JoinForm } from "@/components/join/JoinForm";
import { JOIN_FORM_ID, validateJoin } from "@/lib/join";
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
const submitButton = () => screen.getByRole("button", { name: /Join the club|Joining/ });
async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("First name"), "Sam");
  await user.type(screen.getByLabelText("Email address"), "sam@example.com");
  await user.click(screen.getByRole("checkbox", { name: "I confirm that I'm at least 18 years old." }));
}

describe("validateJoin", () => {
  it("requires a first name, a valid email and the 18+ confirmation", () => {
    expect(validateJoin({ firstName: " ", email: "", over18: false })).toEqual({
      firstName: "Add your first name.",
      email: "Add your email address so we can send club updates.",
      over18: "Confirm that you're 18 or older to join.",
    });
    expect(validateJoin({ firstName: "Sam", email: "nope", over18: true }).email).toMatch(/doesn't look right/);
    expect(validateJoin({ firstName: "Sam", email: "sam@example.com", over18: true })).toEqual({});
  });
});

describe("JoinForm", () => {
  it("uses the Join endpoint, which is not the Questions endpoint", () => {
    expect(JOIN_FORM_ID).toBe("xrppvnln");
    expect(JOIN_FORM_ID).not.toBe(QUESTIONS_FORM_ID);
  });

  it("labels every field, marks them required and leaves the age box unchecked", () => {
    setup();
    expect(screen.getByLabelText("First name")).toHaveAttribute("name", "first_name");
    expect(screen.getByLabelText("First name")).toBeRequired();
    expect(screen.getByLabelText("Email address")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Email address")).toHaveAttribute("autocomplete", "email");
    const age = screen.getByRole("checkbox", { name: "I confirm that I'm at least 18 years old." });
    expect(age).not.toBeChecked();
    expect(age).toBeRequired();
  });

  it("explains that joining includes club emails with an unsubscribe option, and links to Privacy", () => {
    setup();
    const note = screen.getByText(/includes emails about club runs/);
    expect(note).toHaveTextContent(/unsubscribe at any time by contacting us through the Questions form/);
    expect(note).not.toHaveTextContent(/unsubscribe link|one-click/);
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy");
  });

  it("does not describe the age box as a waiver or agreement to participate", () => {
    const { container } = setup();
    expect(container.textContent).not.toMatch(/waiver|release|liabilit|assume|agree to participate/i);
  });

  it("shows linked errors for every missing field, focuses the first, and sends nothing", async () => {
    const { user } = setup();
    await user.click(submitButton());
    const first = screen.getByLabelText("First name");
    expect(first).toHaveAttribute("aria-invalid", "true");
    expect(first).toHaveAccessibleDescription("Add your first name.");
    expect(first).toHaveFocus();
    expect(screen.getByLabelText("Email address")).toHaveAccessibleDescription(/Add your email address/);
    expect(screen.getByRole("checkbox")).toHaveAccessibleDescription(/18 or older to join/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("focuses the email, then the age box, when those are the first problems", async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText("First name"), "Sam");
    await user.type(screen.getByLabelText("Email address"), "not-an-email");
    await user.click(submitButton());
    expect(screen.getByLabelText("Email address")).toHaveFocus();
    await user.clear(screen.getByLabelText("Email address"));
    await user.type(screen.getByLabelText("Email address"), "sam@example.com");
    await user.click(submitButton());
    expect(screen.getByRole("checkbox")).toHaveFocus();
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
    expect(body.get("_subject")).toBe("CMR Join signup");

    resolve(json(200, { ok: true, next: "https://formspree.io/thanks" }));
    const done = await screen.findByRole("status");
    expect(done).toHaveTextContent("YOU'RE IN.");
    expect(done).toHaveTextContent("We've received your signup. You'll hear from us when there's something worth sharing.");
    expect(done).toHaveTextContent("In the meantime, there's a hill with your name on it.");
    await waitFor(() => expect(done).toHaveFocus());
    expect(screen.getByRole("link", { name: "Explore the hills" })).toHaveAttribute("href", "/hills");
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
    expect(screen.getByRole("checkbox")).toBeChecked();
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
    await user.click(submitButton());
    expect(await axeViolations(container)).toEqual([]);
    await fillValid(user);
    await user.click(submitButton());
    await screen.findByText("YOU'RE IN.");
    expect(await axeViolations(container)).toEqual([]);
  });
});
