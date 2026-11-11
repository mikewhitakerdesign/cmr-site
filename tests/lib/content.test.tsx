import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Faq } from "@/components/faq/Faq";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { faq } from "@/content/faq";
import { participantWaiver, participationGuidelines, privacyPolicy, websiteTerms, type LegalDoc } from "@/content/legal";
import { legalLinks } from "@/lib/navigation";
import { WAIVER_ENABLED, WAIVER_VERSION } from "@/lib/waiver";
import { axeViolations } from "../axe";

const docs: [string, LegalDoc | null][] = [
  ["Privacy Policy", privacyPolicy],
  ["Terms of Use", websiteTerms],
  ["Participation Guidelines", participationGuidelines],
];
const text = (d: LegalDoc) => JSON.stringify(d);

describe("legal documents", () => {
  it.each(docs)("%s is published text with no reviewer notes or placeholders", (_, doc) => {
    expect(doc).not.toBeNull();
    expect(text(doc!)).not.toMatch(/\[(PUBLICATION BLOCKER|VERIFY|LEGAL REVIEW|Review this)|BLOCKER|TODO|TBD|lorem/i);
    expect(doc!.updated).toMatch(/^[A-Z][a-z]+ \d{1,2}, \d{4}$/);
  });

  it.each(docs)("%s claims no permit, insurance, entity, Park District or affiliation status", (_, doc) => {
    const t = text(doc!);
    expect(t).not.toMatch(/LLC|nonprofit|non-profit|incorporated|insured|insurance|park district|CPD|partner|endorse|approved by/i);
  });

  it("Participation Guidelines and Terms do not present themselves as a waiver or release", () => {
    expect(text(participationGuidelines!)).toMatch(/do not replace any separate participation agreement or liability release/);
    expect(text(websiteTerms!)).toMatch(/not a participant liability waiver or release/);
  });

  it("Privacy states the manual unsubscribe and invents no retention period, one-click link or newsletter service", () => {
    const t = text(privacyPolicy!);
    expect(t).toMatch(/contacting us through the Questions form/);
    expect(t).toMatch(/do not currently offer a one-click unsubscribe link/);
    expect(t.replace(/18 years old/g, '')).not.toMatch(/\b\d+\s*(days?|months?|years?)\b/i); // no retention period (the only number is the 18+ age)
    expect(t).not.toMatch(/mailchimp|convertkit|klaviyo|substack/i);
  });

  it("Privacy's site-behavior claims match the audit: cookies, analytics, local storage, direct form posts", () => {
    const t = text(privacyPolicy!);
    expect(t).toMatch(/does not set cookies/);
    expect(t).toMatch(/does not use analytics, advertising, or tracking tools/);
    expect(t).toMatch(/Pause motion or Resume motion/);
    expect(t).toMatch(/sends the information directly to Formspree/);
  });

  it("renders a document with its sections and sub-headings", () => {
    render(<LegalDocument title="Privacy Policy" doc={privacyPolicy} />);
    expect(screen.getByRole("heading", { level: 1, name: "Privacy Policy" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "1. Information you provide" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Joining the club" })).toBeInTheDocument();
    expect(screen.getByText(/^Effective November 9, 2026$/)).toBeInTheDocument();
  });

  it.each(docs)("%s page has no axe violations", async (title, doc) => {
    const { container } = render(<LegalDocument title={title} doc={doc} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("FAQ", () => {
  it("has the four approved categories in order", () => {
    expect(faq.map((c) => `${c.number} ${c.title}`)).toEqual(["01 The Club", "02 Running With Us", "03 Schedules & Safety", "04 Staying Connected"]);
    expect(faq.map((c) => c.items.length)).toEqual([5, 8, 6, 4]);
  });

  it("renders every question as a heading inside a disclosure, with its answer in the page", () => {
    const { container } = render(<Faq />);
    expect(screen.getByRole("heading", { level: 1, name: "FREQUENTLY ASKED." })).toBeInTheDocument();
    expect(container.querySelectorAll("details")).toHaveLength(23);
    for (const c of faq) for (const i of c.items) {
      expect(screen.getByRole("heading", { level: 3, name: i.q })).toBeInTheDocument();
      expect(container.textContent).toContain(i.a);
    }
    const nav = screen.getByRole("navigation", { name: "FAQ categories" });
    expect(within(nav).getAllByRole("link")).toHaveLength(4);
  });

  it("describes unsubscribing as a manual request, not a link", () => {
    const a = faq.flatMap((c) => c.items).find((i) => i.q === "Can I stop receiving emails?")!;
    expect(a.a).toMatch(/Questions form/);
    expect(a.a).toMatch(/no one-click unsubscribe link/);
  });

  it("has no axe violations", async () => {
    const { container } = render(<Faq />);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("participant waiver (draft for attorney review)", () => {
  const w = JSON.stringify(participantWaiver);
  it("is retained as a draft but disabled: no public link while WAIVER_ENABLED is false", () => {
    expect(WAIVER_ENABLED).toBe(false);
    expect(legalLinks.find((l) => /waiver/i.test(l.label))?.href).toBeUndefined();
  });
  it("is titled, versioned and marked as an unreviewed draft", () => {
    expect(participantWaiver!.title).toBe("Participant Waiver and Assumption of Risk");
    expect(participantWaiver!.version).toBe(WAIVER_VERSION);
    expect(participantWaiver!.draftNote).toMatch(/not been reviewed or approved by an attorney/);
  });
  it("covers adults only, the activities, the risks, the release with its limits, medical costs and Illinois law", () => {
    for (const re of [/age 18 or older/, /hill repeats/, /traffic/, /ice, snow/, /death/, /ordinary negligence/, /willful or wanton/, /911/, /laws of the State of Illinois/]) expect(w).toMatch(re);
  });
  it("invents no entity, insurance, permit or affiliation, and implies no guaranteed protection", () => {
    expect(w).not.toMatch(/LLC|nonprofit|non-profit|incorporated|park district|CPD|partner/i);
    expect(w).toMatch(/does not state or suggest that CMR carries insurance|carries insurance that covers participants/);
    expect(w).toMatch(/does not guarantee any legal protection/);
  });
  it("renders with its draft note and version, and has no axe violations", async () => {
    const { container } = render(<LegalDocument title={participantWaiver!.title} doc={participantWaiver} />);
    expect(screen.getByText(/Version CMR-WAIVER-001/)).toBeInTheDocument();
    expect(screen.getByText(/Draft for review/)).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });
});
