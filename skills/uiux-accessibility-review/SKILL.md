---
name: uiux-accessibility-review
description: Review UI accessibility using rendered behavior and source evidence.
  Use for keyboard, focus, semantics, forms, contrast and reduced-motion audits; report
  tested scope without claiming automatic compliance.
---

# Accessibility review with reproducible findings

Define the target screens, task flows and supported input methods. Inspect the rendered UI and source where available. If only screenshots exist, limit conclusions to visible evidence; keyboard, semantics and screen-reader behavior remain unverified.

Follow a real task with keyboard: reach controls, perceive focus, activate, enter and correct data, dismiss overlays and return. Check dynamic insertion/removal and whether focus becomes lost or obscured by sticky regions. Prefer native controls; review custom widgets against the applicable [WAI-ARIA APG pattern](https://www.w3.org/WAI/ARIA/apg/patterns/).

Check accessible names and roles, label/error associations, heading structure, alternatives to meaningful images, status announcements and information conveyed only by color. Ensure error recovery preserves entered data. Avoid adding ARIA where native semantics already work.

Inspect zoom/reflow, contrast for actual rendered combinations, target usability, reduced motion and gesture alternatives as relevant. Use tools for measurable checks, and manually inspect behavior they cannot establish. Do not describe an automated scan as a full WCAG certification.

Report each finding with affected task, reproduction, evidence, severity, proposed remedy and retest result. Separate confirmed failures from questions requiring assistive technology or hardware. If asked only to audit, do not rewrite the interface; if fixes are requested, preserve appearance and behavior outside the defect.

Example acceptance: a validation error identifies the field and problem, remains available to assistive technology, and can be corrected without losing the rest of the form.
