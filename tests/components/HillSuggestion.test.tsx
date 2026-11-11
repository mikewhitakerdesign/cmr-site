import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Faq } from "@/components/faq/Faq";
import { HillSuggestionLink } from "@/components/hills/HillSuggestionLink";
import { HILL_SUGGESTION_FORM_ID, HILL_SURFACES, validateHillSuggestion } from "@/lib/hill-suggestion";
import { QUESTIONS_FORM_ID } from "@/lib/questions";
import { axeViolations } from "../axe";

/** Formspree is never contacted: `fetch` is replaced and any unexpected call fails. */
let fetchMock: ReturnType<typeof vi.fn>;
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

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

const trigger = () => screen.getByRole("button", { name: "We'd love to hear about it." });
async function open() {
  const user = userEvent.setup();
  render(
    <p>
      Got a hill? <HillSuggestionLink>We&apos;d love to hear about it.</HillSuggestionLink>
    </p>,
  );
  await user.click(trigger());
  return { user, dialog: await screen.findByRole("dialog", { name: "Know a hill?" }) };
}

describe("validateHillSuggestion", () => {
  it("requires only the location; rise and email are checked only when given", () => {
    expect(validateHillSuggestion({ location: " ", rise: "", email: "" }).location).toMatch(/where the hill is/);
    expect(validateHillSuggestion({ location: "Cricket Hill", rise: "", email: "" })).toEqual({});
    expect(validateHillSuggestion({ location: "x", rise: "abc", email: "" }).rise).toBeDefined();
    expect(validateHillSuggestion({ location: "x", rise: "-4", email: "" }).rise).toBeDefined();
    expect(validateHillSuggestion({ location: "x", rise: "42.5", email: "" })).toEqual({});
    expect(validateHillSuggestion({ location: "x", rise: "", email: "nope" }).email).toMatch(/doesn't look right/);
  });
  it("uses its own Formspree form, not the Questions form", () => {
    expect(HILL_SUGGESTION_FORM_ID).toBe("mjywvydn");
    expect(HILL_SUGGESTION_FORM_ID).not.toBe(QUESTIONS_FORM_ID);
  });
});

describe("Hill suggestion modal", () => {
  it("opens as a labelled dialog with the supporting copy, and Location is the only required field", async () => {
    const { dialog } = await open();
    expect(dialog).toHaveAccessibleDescription("Found a Chicago-area hill worth running? Tell us where it is and what makes it worth climbing.");
    const q = within(dialog);
    expect(q.getByLabelText(/Address or map pin/)).toBeRequired();
    for (const l of [/Hill name/, /Elevation gain/, /Surface/, /What do you love/, /Your email/]) expect(q.getByLabelText(l)).not.toBeRequired();
    expect(q.getAllByRole("option")).toHaveLength(HILL_SURFACES.length + 1);
    expect(q.getByLabelText(/Hill name/)).toHaveFocus();
    expect(await axeViolations(document.body)).toEqual([]);
  });

  it("closes with the button and returns focus to the link", async () => {
    const { user } = await open();
    await user.click(screen.getByRole("button", { name: "Close hill suggestion" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
  });

  it("closes when the platform closes it (Escape) and returns focus", async () => {
    await open();
    document.querySelector("dialog")!.close();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger()).toHaveFocus();
  });

  it("blocks an empty location, names the problem and focuses the field, without sending", async () => {
    const { user, dialog } = await open();
    await user.type(within(dialog).getByLabelText(/Hill name/), "Test hill");
    await user.click(within(dialog).getByRole("button", { name: "Suggest a hill" }));
    const field = within(dialog).getByLabelText(/Address or map pin/);
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription(/where the hill is/);
    expect(field).toHaveFocus();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a bad optional email, and sends once with descriptive names and the form identifier", async () => {
    let resolve!: (r: Response) => void;
    fetchMock.mockImplementation(() => new Promise<Response>((r) => (resolve = r)));
    const { user, dialog } = await open();
    const q = within(dialog);
    await user.type(q.getByLabelText(/Address or map pin/), "https://maps.app.goo.gl/abc");
    await user.type(q.getByLabelText(/Your email/), "nope");
    await user.click(q.getByRole("button", { name: "Suggest a hill" }));
    expect(q.getByLabelText(/Your email/)).toHaveAttribute("aria-invalid", "true");
    expect(fetchMock).not.toHaveBeenCalled();

    await user.clear(q.getByLabelText(/Your email/));
    await user.type(q.getByLabelText(/Elevation gain/), "60");
    await user.selectOptions(q.getByLabelText(/Surface/), "Grass");
    await user.type(q.getByLabelText(/What do you love/), "Sledding in winter");
    await user.click(q.getByRole("button", { name: "Suggest a hill" }));
    const sending = await q.findByRole("button", { name: "Sending…" });
    expect(sending).toBeDisabled();
    await user.click(sending);
    await user.keyboard("{Enter}");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(`https://formspree.io/f/${HILL_SUGGESTION_FORM_ID}`);
    const body = init.body as FormData;
    expect(body.get("form")).toBe("hill_suggestion");
    expect(body.get("location")).toBe("https://maps.app.goo.gl/abc");
    expect(body.get("rise_ft")).toBe("60");
    expect(body.get("surface")).toBe("Grass");
    expect(body.get("notes")).toBe("Sledding in winter");
    expect(body.get("hill_name")).toBe("");
    expect(body.get("email")).toBe("");

    resolve(json(200, { ok: true, next: "https://formspree.io/thanks" }));
    const done = await screen.findByRole("status");
    expect(done).toHaveTextContent("Thanks for the suggestion! We'll take a look and see if it's worth adding to the rotation.");
    await waitFor(() => expect(done).toHaveFocus());
  });

  it("keeps what was typed on a server or network error and allows another try", async () => {
    fetchMock.mockResolvedValueOnce(json(500, { errors: [{ message: "Server exploded" }] }));
    const { user, dialog } = await open();
    const q = within(dialog);
    await user.type(q.getByLabelText(/Address or map pin/), "Horner Park");
    await user.click(q.getByRole("button", { name: "Suggest a hill" }));
    expect(await q.findByRole("alert")).toHaveTextContent("Your suggestion didn't send.");
    expect(q.getByLabelText(/Address or map pin/)).toHaveValue("Horner Park");
    expect(q.getByRole("button", { name: "Suggest a hill" })).toBeEnabled();

    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    await user.click(q.getByRole("button", { name: "Suggest a hill" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(await q.findByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});

describe("FAQ contact link", () => {
  it("opens the existing Questions dialog (not the hill suggestion form) and returns focus", async () => {
    const user = userEvent.setup();
    render(<Faq />);
    const link = screen.getByRole("button", { name: "Questions form" });
    await user.click(link);
    const dialog = await screen.findByRole("dialog", { name: "Questions about the club?" });
    expect(within(dialog).getByLabelText("Your question")).toHaveFocus();
    expect(screen.queryByRole("dialog", { name: "Know a hill?" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close questions" }));
    expect(link).toHaveFocus();
  });
});
