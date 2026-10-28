---
name: uiux-component-engineering
description: Build or refactor reusable UI components with clear APIs, state ownership,
  semantics and composition. Use for component libraries, complex controls or reusable
  interface architecture.
---

# Components as behavior contracts

Inspect the framework version, existing primitives and design system. Do not impose React patterns on another stack or replace a working library without a task-specific reason. Classify the intended surface before choosing navigation or density.

Define the component's purpose, content slots, variants, state owner and events. Distinguish controlled state from internal state and choose an explicit source of truth. Prefer small composable parts when configuration flags create invalid combinations; do not split a simple component merely to demonstrate architecture.

Use native semantics when they provide the required interaction. A tab changes a panel, a link navigates, a button performs an action, and a disclosure expands content; visual similarity does not make them interchangeable. Consult [WAI-ARIA patterns](https://www.w3.org/WAI/ARIA/apg/patterns/) for custom web widgets when necessary.

Write the relevant behavior matrix before implementation: idle, focused, active/selected, disabled, loading, empty, error and success. Define focus entry, keyboard commands, dismissal, focus return and what happens when content disappears. Re-rendering a list must not silently send keyboard focus to the document body.

Keep data fetching and domain rules outside reusable presentation primitives unless the component explicitly owns them. Handle duplicate actions, stale async results and cancellation where the task actually involves async state. Never report success before the operation succeeds.

Deliver the component, a small usage example and tests for meaningful behavior. Validate keyboard interaction, long labels, empty content, state changes and mobile layout. For React-specific composition advice, verify the project's version before applying [Vercel composition patterns](https://github.com/vercel-labs/agent-skills/tree/main/skills/composition-patterns).

Example acceptance: a dialog can open by keyboard, keeps focus appropriately while modal, closes with the defined action, and returns focus to the trigger or a sensible surviving element.
