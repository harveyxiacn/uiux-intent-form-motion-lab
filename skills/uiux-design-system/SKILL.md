---
name: uiux-design-system
description: Define or extend UI design tokens and component variants across a product.
  Use for design systems, themes, token consolidation and visual consistency; not
  for a one-off motion change.
---

# Design systems with a stable contract

Inspect existing tokens, components and actual screens before introducing a system. Identify website, Dashboard Web UI and mobile surfaces separately; shared identity does not require identical density or navigation.

1. Inventory repeated decisions and disagreements: color roles, type scale, spacing, radius, elevation, motion and component variants. Preserve established brand constraints.
2. Separate raw values from semantic roles and component overrides only where the distinction solves a real need. For example, a selected navigation background and a primary action background may share a value today without sharing meaning.
3. Specify supported themes and states. Check readable combinations for text, muted text, controls, selection and focus. Do not create dark mode by blindly inverting colors.
4. Define a small component-state matrix: default, hover when applicable, focus, pressed, selected, disabled, loading and error. Omit irrelevant states and include distinctions such as read-only versus disabled.
5. Map existing values to tokens incrementally. Show representative before/after screens and identify intentional exceptions. Avoid replacing every numeric value or creating a token for every isolated pixel.

Deliver a concise token map, usage rules, representative component variants and migration scope. Implement only when requested; validate the actual theme combinations, long content and relevant viewports. A token file alone does not establish visual consistency.

Example acceptance: switching a supported theme preserves visible focus and text readability; website and Dashboard share brand roles while keeping their own layout density.
