---
name: uiux-motion-engineering
description: Implement or repair interface animations and transitions, including interruption,
  reduced motion and performance. Use when motion code or motion behavior must change;
  naming an effect alone belongs to interaction specification.
---

# Motion that preserves task state

Start with the actual interaction contract and platform. Decide what motion communicates: feedback, continuity, hierarchy or spatial change. A frequently repeated action may need minimal or no animation. Honor the requested visual direction without adding motion to unrelated controls.

Use existing duration and easing tokens. Propose values based on distance, input and frequency and label them as choices, not measured facts or universal rules. Prefer existing CSS or platform facilities for simple effects; add a library only when its benefit warrants the dependency.

Separate business state from presentation progress. The operation must remain correct if animation is disabled, canceled, interrupted or skipped. Repeated activation should reverse, retarget, queue or ignore according to an explicit policy; never leave invisible interactive elements or stuck loading states.

Prefer transform and opacity when they preserve the intended effect. When layout animation is necessary, measure its cost rather than claiming it is automatically wrong. Batch measurements and writes, clean up listeners and animation handles, and avoid unbounded loops or permanent layer promotion. A screenshot cannot prove smoothness.

For reduced motion, preserve state and feedback while removing unnecessary spatial travel. Keep an equivalent keyboard/touch action for gestures and gate hover treatments to appropriate input capabilities. Retain focus and avoid scroll hijacking.

Verify normal playback, rapid repeat, reversal, removal/unmount, reduced motion and slow work where applicable. Use runtime traces for performance claims and report device/browser and untested cases. Deliver the changed behavior, chosen timings and verification evidence.

Example acceptance: rapidly opening and closing a sheet never leaves a backdrop blocking the page; with reduced motion, the same form is accessible immediately and dismissal restores focus.

Related specialist reference: [Emil Kowalski skills](https://github.com/emilkowalski/skills), including animate and animation-performance. These are optional resources, not runtime dependencies.

## Handoff

Receives the interaction and component contracts. Hands over proposed timings, an interruption policy, a reduced-motion variant and runtime evidence for `uiux-accessibility-review`. Mark choices and assumptions separately from facts and carry anything unverified forward. When a request spans several stages, `uiux-workflow` decides the order.
