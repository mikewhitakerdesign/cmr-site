import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NewsletterSignup, { resolveFormAction } from "@/components/NewsletterSignup";
import { axeViolations } from "../axe";

const ENDPOINT = "https://provider.example/subscribe";

describe("NewsletterSignup — unconfigured (no provider yet)", () => {
  it("renders the design but disables the form and explains why", () => {
    render(<NewsletterSignup action={undefined} />);
    const input = screen.getByRole("textbox", { name: "Email address" });
    const button = screen.getByRole("button", { name: "Join the list" });
    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("Newsletter signup isn’t open yet.");
  });

  it("never posts to a placeholder: the form has no action", () => {
    const { container } = render(<NewsletterSignup action={undefined} />);
    expect(container.querySelector("form")).not.toHaveAttribute("action");
  });
});

describe("NewsletterSignup — configured", () => {
  it("posts straight to the provider endpoint (no CMR server route)", () => {
    const { container } = render(<NewsletterSignup action={ENDPOINT} />);
    const form = container.querySelector("form")!;
    expect(form).toHaveAttribute("action", ENDPOINT);
    expect(form).toHaveAttribute("method", "post");
    expect(screen.getByRole("button", { name: "Join the list" })).toBeEnabled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("uses a labelled, required email field with the provider's field name", () => {
    render(<NewsletterSignup action={ENDPOINT} emailFieldName="EMAIL" />);
    const input = screen.getByRole("textbox", { name: "Email address" });
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("name", "EMAIL");
    expect(input).toHaveAttribute("autocomplete", "email");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("placeholder", "you@email.com");
  });

  it("passes provider hidden fields through", () => {
    const { container } = render(<NewsletterSignup action={ENDPOINT} hiddenFields={{ u: "abc", id: "123" }} />);
    const hidden = [...container.querySelectorAll('input[type="hidden"]')].map((i) => [
      i.getAttribute("name"),
      i.getAttribute("value"),
    ]);
    expect(hidden).toEqual([
      ["u", "abc"],
      ["id", "123"],
    ]);
  });

  it("has no axe violations", async () => {
    const { container } = render(<NewsletterSignup action={ENDPOINT} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("NewsletterSignup — content", () => {
  it("defaults to the Figma copy with the struck-through 'hills'", () => {
    render(<NewsletterSignup />);
    expect(screen.getByRole("heading", { level: 2, name: "Get the next run in your inbox." })).toBeInTheDocument();
    expect(screen.getByText("hills").tagName).toBe("S");
  });

  it("supports a different heading level and copy", () => {
    render(<NewsletterSignup headingLevel="h3" heading="Dispatches" description="Occasionally." />);
    expect(screen.getByRole("heading", { level: 3, name: "Dispatches" })).toBeInTheDocument();
  });
});

describe("resolveFormAction", () => {
  it.each([
    [ENDPOINT, ENDPOINT],
    ["http://provider.example/subscribe", null],
    ["javascript:alert(1)", null],
    ["/api/subscribe", null],
    ["", null],
    [undefined, null],
  ])("%s → %s", (input, expected) => {
    expect(resolveFormAction(input)).toBe(expected);
  });
});
