import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

describe("Button (MWDS)", () => {
  it("defaults to the MWDS primary variant", () => {
    render(<Button>Go</Button>);
    const button = screen.getByRole("button", { name: "Go" });
    expect(button).toHaveClass("bg-primary", "text-primary-foreground", "hover:bg-primary-hover", "h-9");
    expect(button).toHaveAttribute("data-slot", "button");
  });

  it("maps secondary to the MWDS secondary (CMR warm cream) tokens", () => {
    render(<Button variant="secondary">Go</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-secondary", "hover:bg-secondary-hover");
  });

  it("renders the Extra Large size used by 'Join the list'", () => {
    render(<Button size="xl">Join the list</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-12", "px-(--space-2xl)", "text-p");
  });

  it("can render a link with button styling (asChild)", () => {
    render(
      <Button asChild>
        <a href="/join">Join</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Join" });
    expect(link).toHaveClass("bg-primary");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("uses the 3px MWDS focus ring", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button")).toHaveClass("focus-visible:ring-3", "focus-visible:ring-ring");
  });
});

describe("Input (MWDS)", () => {
  it("binds the MWDS input tokens", () => {
    render(<Input aria-label="Email" />);
    expect(screen.getByRole("textbox")).toHaveClass(
      "bg-input",
      "border-border",
      "shadow-xs",
      "rounded-lg",
      "placeholder:text-muted-foreground",
      "focus-visible:border-border-4",
      "aria-invalid:border-destructive-border",
    );
  });

  it("lets callers override height without losing MWDS styling", () => {
    render(<Input aria-label="Email" className="h-12" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("h-12", "bg-input");
    expect(input).not.toHaveClass("h-10");
  });
});

describe("cn", () => {
  it("does not mistake MWDS type-scale utilities for text colors", () => {
    expect(cn("text-p-sm text-primary-foreground")).toBe("text-p-sm text-primary-foreground");
    expect(cn("text-p-sm", "text-p-lg")).toBe("text-p-lg");
  });
});
