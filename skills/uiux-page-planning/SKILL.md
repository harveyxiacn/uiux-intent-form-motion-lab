---
name: uiux-page-planning
description: Plan a web page or app screen before implementation by defining its audience, goal, content hierarchy, sections, and user journey. Use for a page brief, content structure, or UI requirements. Not for choosing visual style or specifying motion.
---

# Plan the page

Before selecting a layout, visual language or interaction, identify the intended surface: **marketing/content website**, **mobile app/miniprogram**, or **dashboard / Web UI**. Read [surface routing](references/surface-routing.md) when the request spans categories or the reference could be misclassified. Judge by the product's purpose, task and input context; browser hosting or interactivity does not make a site an app, and an app does not automatically mean a dashboard.

Translate the user's idea into a usable page plan before choosing a visual treatment or writing code. Respect existing product facts, brand, content and scope. Inspect the existing screen and project context when revising one; distinguish an explicit constraint from an assumption.

1. Identify the audience, their situation and the action or understanding the page should enable. If essential information is absent, make a reasonable labeled assumption or ask a focused question when it would change the outcome.
2. Decide the first-screen priority and information hierarchy. Map the page into sections or screen regions; give each a job, content, and next action. For an app, account for the main task and meaningful empty, loading and error states.
3. Choose the layout around the user's goal and data: for example, task priority, trend comparison, content, calendar, or map. These are options, not templates; combine them only when useful.
4. Deliver a concise brief with audience, goal, primary action, ordered structure, required content, constraints, and open assumptions. If implementation is requested, use the plan to proceed; planning alone does not authorize inventing facts or changing unrelated pages.

For handoff, describe what matters and why; avoid turning a request for planning into an unsolicited redesign. Verify the plan against actual content and the user's stated goals.

Example acceptance: someone who did not attend the discussion can read the brief and name the surface, the primary action, the first-screen priority and which states (empty, loading, error) the screen must show.

## Handoff

Receives the user's request, existing screens and product facts. Hands over a brief (surface, audience, primary action, ordered regions, required states, assumptions) for `uiux-style-direction` and `uiux-interaction-spec`. Mark choices and assumptions separately from facts and carry anything unverified forward. When a request spans several stages, `uiux-workflow` decides the order.
