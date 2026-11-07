---
seed_version: '0.1'
id: implement-mwds-code-connect
title: Map MWDS Figma components to code with Code Connect (Button and Input first)
objective: >-
  Connect the MWDS Figma components used by CMR to their code implementations
  through Figma Code Connect, starting with Button and Input, so design-to-code
  work reuses the real components instead of regenerating markup.
status: proposed
stage: research
active_capability: research-discovery
bundle_references:
  - software-engineering
  - web-ui-experience
  - external-action-integration
authority_requirement: owner-authorization-required
validation_state: not-started
blocker_state: awaiting-owner-review
current_responsibility: owner
created_at: '2026-11-07T08:00:00.000Z'
updated_at: '2026-11-07T08:00:00.000Z'
---
## Objective

Make Figma's design-to-code output point at the code components instead of
regenerating raw markup. During `implement-cmr-mwds-foundation-and-shared-ui`,
Figma reported that the CMR file's MWDS instances (the newsletter form's
Input and Button) have no Code Connect mappings.

## Status

**Captured only; not started.** The Owner (2026-11-07) asked for Code Connect
as the next governed increment, beginning with Button and Input, and will
review the component architecture and Figma relationships before work
begins. No Code Connect files, packages, or Figma changes exist yet.

## Proposed first scope

| Figma (MWDS library `H08HgMeVx6V23wY7aZdENf`) | Code | Known gaps to resolve first |
|---|---|---|
| Button component set (contains variant key `e846ae48…`, Primary / Extra Large / Default) | `src/components/ui/button.tsx` | Figma has Variant = Primary, Secondary, Outline, Ghost, Destructive; code implements Primary and Secondary only. Figma Size = Default, Small, Mini, Large, Extra Large; code has default, lg, xl. Figma `Roundness=Round` and left/right icon props have no code equivalent. Figma `State` (Hover & Active, Focus, Disabled) is interaction state in code, not a prop; only Disabled maps (`disabled`). |
| Input component set (contains variant key `e94e2497…`, Large / Default / Placeholder) | `src/components/ui/input.tsx` | Figma Size = Regular, Large, Small, Mini; code has one size (Large) with height overrides. Figma State: Error maps to `aria-invalid`, Disabled to `disabled`; Empty, Placeholder, Value, and Focus are runtime states. Figma has prepend/append and decoration props that code lacks. |

Out of the first scope: the CMR-specific Header, Footer, and NewsletterSignup
(they are CMR compositions, not MWDS library components), and the Join Us
CTA, which is not an MWDS instance.

## Decisions needed before work begins (Owner)

1. **Where mappings live.** MWDS is a shared, product-agnostic library;
   `mwd-x-shadcn` says it must not contain CMR-specific code, yet Button and
   Input currently live only in `cmr-site`. Mapping shared library components
   to a product repository would make CMR the canonical MWDS implementation.
   The options are: (a) map to `cmr-site` now, labeled as CMR's
   implementation; (b) move the primitives into `mwd-x-shadcn` first and map
   there; (c) map in `cmr-site` now with a planned migration.
2. **Variant parity.** Implement the missing Figma variants and sizes in code
   before mapping, or map only the implemented subset and document the gaps.
3. **Mechanism.** The Code Connect CLI with checked-in `*.figma.tsx` files
   (reviewable and versioned; adds the `@figma/code-connect` devDependency),
   or MCP-created mappings (no repo files, less reviewable). The CLI is the
   recommended option.
4. **Plan prerequisite.** Code Connect requires a Figma plan and seat that
   support Dev Mode and Code Connect. Verify the account's plan (Figma MCP
   `whoami`) before committing to an approach.

## Authority requirement

Owner authorization required. Publishing Code Connect mappings writes to the
Figma library, which is shared beyond this repository: an external action
across the project boundary, beyond the read-only Figma access used so far.
Authoring mapping files locally is reversible, but this increment does not
start until the Owner approves the decisions above.

## Acceptance criteria (draft)

- Button and Input mappings resolve in Figma Dev Mode to the code components,
  with variant and prop mappings that match the decisions above.
- Unmapped Figma variants and props are documented, not silently dropped.
- `get_design_context` on a CMR newsletter form returns Code Connect
  references instead of generated markup.
- No changes to the Figma design compositions.
