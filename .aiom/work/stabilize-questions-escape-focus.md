---
seed_version: '0.1'
id: stabilize-questions-escape-focus
title: Fix the intermittent Questions-panel Escape failure (focus left on body after sending)
objective: >-
  Remove the cause of the intermittent browser-CI failure in home.spec.ts "the
  Questions panel validates, sends through Formspree (mocked) and confirms":
  after a question is sent, Escape sometimes did not close the floating panel.
  Fix the underlying focus gap without weakening the test, and add deterministic
  regression coverage.
status: active
stage: implementation
active_capability: software-implementation
bundle_references:
  - software-engineering
  - web-ui-experience
authority_requirement: owner-authorization-satisfied
validation_state: in-progress
blocker_state: none
current_responsibility: orchestrator
created_at: '2026-11-11T00:00:00.000Z'
updated_at: '2026-11-11T00:00:00.000Z'
---
## Status

**In progress (2026-11-11):** fix and regression tests on branch `fix/questions-escape-test-race`; PR, CI and merge follow.

## Authorization

Owner instruction of 2026-11-11 (after the custom-domain launch): resolve the intermittent Playwright failure as a small, isolated maintenance task, without weakening the test or making unrelated application changes; run it repeatedly locally, open a narrowly scoped PR, verify CI, and merge it and its closeout if the correction is narrow and all required checks are green. No approval artifact was added; the instruction is recorded here. It does not extend to CI infrastructure, feature flags or unrelated components.

## Evidence

- **Failure history.** The test failed on `main` push runs `5eec06a` (run `42764702806`, 2026-11-10) and `6bf77b1` (run `43063373921`, 2026-11-11), desktop project only, with the same assertion (`home.spec.ts:836`, `expect(dialog).toBeHidden()` received "visible"). It passed on `main` at `b1884cd` and `6bc23e9`, and in roughly 26 of the last 28 runs that reached the e2e step. The other red CI runs in that window are different tests (`science.spec.ts`) and out of scope here. The first failure predates PR #27, so the cause was not introduced by it.
- **Cause (reproduced).** Sending replaces the form with the success message, which removes the focused "Send question" button, so `document.activeElement` becomes `<body>`. `QuestionsPanel` moved focus to the message in a **passive** effect, after the commit. Escape is handled by the panel's `onKeyDown`, so a key pressed while focus was on `<body>` reached nothing. The test waited only for the message text (`toContainText`), which is satisfied as soon as the DOM updates, then pressed Escape, so on a slow runner it fell into the gap. A MutationObserver recording `document.activeElement` at the instant the message was inserted read `BODY` in 45 of 45 runs. With the original test flow under CPU throttling, Escape was lost in 0 of 15 runs at 1x, 2 of 15 at 4x and 6 of 15 at 6x.
- **Classification.** Both: a test synchronization race (it treats "message visible" as settled), and a small real interaction defect (focus is dropped to `<body>` for a moment when the focused control is removed, during which the documented dismiss key does nothing). It is narrow: one shared component, no broader application issue and no change to keyboard behavior other than closing the gap.

## Correction

`src/components/QuestionsPanel.tsx` (the form shared by the floating panel and the modal dialog): focus is now moved in a **layout** effect, in the same commit that swaps the form and the success message, so it is never left on `<body>`. The opening focus stays a passive effect on purpose: `QuestionsDialog` opens its `<dialog>` in a layout effect of its own, which runs after the child's layout effects, so moving the opening focus earlier would focus an element in a still-closed dialog. No other application file changed. The existing test is unchanged (not weakened, no timeouts, no retries); it now passes deterministically because the state it waits for already includes the focus.

## Regression coverage

`tests/e2e/questions-focus.spec.ts` records `document.activeElement` at the instant the new content is inserted, so it does not depend on timing: for the floating panel (every page), for the modal dialog on `/calendar` (while runs are on hold), and for "Ask another question" returning to the form. Run against the unfixed component, the two success-path tests fail with focus on `BODY`; against the fix they pass.

## Local validation

After the fix, with the same CPU-throttled flow: Escape closed the panel in 60 of 60 runs (1x, 4x, 6x and 10x), focus already on the message when it appeared in 60 of 60. `questions-focus.spec.ts`: 60 of 60 (20 repeats). The original `home.spec.ts` test: 90 of 90 (30 repeats on each of mobile, tablet and desktop). Dialog, hold and shared-UI Questions specs: 135 of 135 (5 repeats). Full gates: see the PR.
