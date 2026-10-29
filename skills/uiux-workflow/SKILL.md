---
name: uiux-workflow
description: Route a UI/UX request through this project's uiux-* skills in order, decide which stages apply, and pass a concrete artifact from each stage to the next (brief, direction, tokens, interaction contract, component contract, motion evidence, handheld check, accessibility findings, final prompt). Use when a request spans more than one stage — "design and build this screen", "make this feature feel premium", "the delete animation feels wrong" — or when unsure which uiux-* skill to start with. Not needed when the task clearly belongs to a single skill.
---

# Run the UI/UX skills as one pipeline

The uiux-* skills are stages, not alternatives. Each one consumes the previous stage's artifact and produces the next. Most failures come from skipping a stage silently (styling before the task is known, animating before the state model exists) or from re-doing a stage whose artifact already exists.

## Route the request

1. Restate the request in the user's words and name the surface: website, mobile app / miniprogram, or Dashboard / Web UI (see `uiux-page-planning/references/surface-routing.md`).
2. Collect the artifacts that already exist: product brief, brand or tokens, existing components, reference screens, prior audit. Treat existing project facts as constraints.
3. Start at the **earliest stage whose artifact is missing** and that the request actually needs. Stop at the stage the user asked for; planning-only or audit-only requests do not authorize implementation.

| # | Stage | Skill | Hands over | Skip when |
| --- | --- | --- | --- | --- |
| 1 | Intent | `uiux-page-planning` | Brief: audience, task, primary action, ordered regions, required states, assumptions | A brief or existing screen already fixes the task |
| 2 | Look | `uiux-style-direction` | Direction: composition, type, color roles, imagery, each with a visible check | Brand and screens already decide the look |
| 3 | Tokens | `uiux-design-system` | Token map with semantic roles, supported themes, checked contrast pairs | One-off change that fits existing tokens |
| 4 | Behavior | `uiux-interaction-spec` | Interaction contract: purpose, trigger, sequence, result/reversal, access/fallback | No interaction changes |
| 5 | Parts | `uiux-component-engineering` | Component contract: state owner, events, state matrix, focus policy | No reusable component is created or changed |
| 6 | Motion | `uiux-motion-engineering` | Timings labelled as proposals, interruption policy, reduced-motion variant, runtime evidence | Nothing moves |
| 7 | Hand | `uiux-mobile-patterns` | Handheld check: reach, safe areas, keyboard, gesture alternatives, return path | Not a handheld surface |
| 8 | Evidence | `uiux-accessibility-review` | Findings with reproduction, severity, fix and retest; untested scope listed | Never skip when shipping UI |
| 9 | Prompt | `uiux-prompt-playbook` | Scene / action / feel / boundary / acceptance prompt assembled from 1–8 | Implementation is done directly, not delegated |

Upstream snapshots (`finesse-ui`, `impeccable`, `ui-ux-pro-max`, …) can lead stages 2–8 when installed; keep one lead skill per stage and pass the same artifact.

## Handoff rules

- Every artifact separates **facts** (from the user or project), **choices** (proposed by you, with reason) and **assumptions** (unconfirmed). Do not promote a choice to a fact in a later stage.
- Carry an **unverified list** forward. A later stage may close an item only with runtime evidence; it never disappears quietly.
- Business state is decided by stages 1, 4 and 5. Stages 2, 3 and 6 may change presentation only.
- If a later stage contradicts an earlier artifact (the motion needs a state the contract lacks), return to the earlier stage and amend its artifact rather than patching around it.
- Keep artifacts short: a few lines per field. Templates are in [handoff artifacts](references/handoff-artifacts.md).

## Report

End with: stages run and skipped (with reason), the final artifact or change, what was verified in a rendered UI, and the remaining unverified list. Do not claim accessibility compliance, performance or device behavior that was not tested.

## Example

Request: 「卡片删除时飞走，别太夸张」 for a to-do app.

1. Brief: App surface; the user clears finished or mistaken tasks one-handed; deletion must be undoable; empty state required.
2. Direction: calm list, one accent reserved for the primary action; motion stays subordinate to content.
3. Tokens: `--danger` only on the delete affordance; muted text checked ≥ 4.5:1 in both themes.
4. Contract: swipe past 40% of row width **or** use the row's “more” menu **or** press Delete; row leaves left, list closes the gap, an undo toast appears; undo restores the row in place.
5. Component: list owns the data; the row owns drag progress only; focus moves to the next row, else the previous, else the empty-state heading.
6. Motion: leave ≈ 220 ms with ≤ 3° tilt and no bounce (“别太夸张”); gap closes ≈ 180 ms; undo mid-flight reverses; reduced motion fades without travel. Values are proposals.
7. Hand: swipe has a visible menu alternative; the toast sits above the tab bar and home indicator.
8. Evidence: removal announced in a polite live region; focus never lands on `body`; contrast measured per theme. Real screen-reader and device testing remain unverified.
9. Prompt: the five-field prompt built from 1–8.

Acceptance: another person can read the handoffs and predict what the delete does on keyboard, touch and reduced motion without opening the code.
