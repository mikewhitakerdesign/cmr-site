/**
 * The CMR headline rules, as checks (Brand Standards, Voice). Pure functions:
 * the interactive checker on /brand/voice and its tests read the same list, so
 * the tool can never disagree with the written rules beside it.
 *
 * The rules are inferred from the headlines on the live site ("Bad weather.
 * Good hills.", "New here? Good.", "Flat is a state of mind."); they describe
 * what CMR already does, not a new policy.
 */

/** Stock motivation and tough-talk the voice avoids (see Voice, "Words we use"). */
export const AVOID_WORDS = ["crush", "crushing", "beast", "warrior", "warriors", "epic", "journey", "tribe", "unleash", "conquer", "grind", "hustle", "limitless"] as const;

/** Words that keep their capital in a sentence-case headline. */
const PROPER = new Set([
  "chicago", "cmr", "cricket", "warren", "horner", "schiller", "trashmore", "montrose", "evanston", "mt", "i", "i'm", "i've",
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "mtns",
  // Place words that are capitalized as part of a name ("Warren Park", "Schiller Woods", "Montrose Harbor").
  "park", "woods", "harbor", "beach", "james",
]);

export const MAX_HEADLINE_WORDS = 8;

export type HeadlineCheck = { id: "ending" | "exclamation" | "length" | "case" | "words"; label: string; pass: boolean; detail: string };

const wordsOf = (text: string) => text.trim().split(/\s+/).filter(Boolean);
/** A word without the punctuation around it ("Montrose." → "Montrose"); apostrophes inside it stay. */
const bare = (w: string) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");

export function checkHeadline(text: string): HeadlineCheck[] {
  const t = text.trim();
  const words = wordsOf(t);
  const letters = t.replace(/[^\p{L}]/gu, "");
  const allCaps = letters.length > 0 && letters === letters.toUpperCase();

  // Sentence case: after the first word of each sentence, only proper nouns are capitalized.
  const starts = new Set<number>([0]);
  words.forEach((w, i) => {
    if (/[.?!]$/.test(w)) starts.add(i + 1);
  });
  const stray = words.filter((w, i) => {
    const b = bare(w);
    return !starts.has(i) && /^\p{Lu}/u.test(b) && !PROPER.has(b.toLowerCase());
  });

  const banned = words.map((w) => bare(w).toLowerCase()).filter((w) => (AVOID_WORDS as readonly string[]).includes(w));

  return [
    { id: "ending", label: "Ends with a period or a question mark", pass: /[.?]$/.test(t), detail: "A CMR headline is a complete, flat statement. It stops." },
    { id: "exclamation", label: "No exclamation mark", pass: !t.includes("!"), detail: "The joke is in the understatement. The site has two, and one of them is about the moon." },
    {
      id: "length",
      label: `${MAX_HEADLINE_WORDS} words or fewer`,
      pass: words.length > 0 && words.length <= MAX_HEADLINE_WORDS,
      detail: `${words.length} ${words.length === 1 ? "word" : "words"}. Short enough to set at display size.`,
    },
    {
      id: "case",
      label: "Sentence case, or all caps for a statement",
      pass: allCaps || stray.length === 0,
      detail: stray.length && !allCaps ? `Title Case reads as marketing: ${stray.map(bare).join(", ")}.` : "Capitals for the first word and proper nouns only.",
    },
    {
      id: "words",
      label: "No stock motivation",
      pass: banned.length === 0,
      detail: banned.length ? `Avoid: ${[...new Set(banned)].join(", ")}.` : "Nothing to crush, conquer or unleash here.",
    },
  ];
}

export const headlinePasses = (text: string) => checkHeadline(text).every((c) => c.pass);
