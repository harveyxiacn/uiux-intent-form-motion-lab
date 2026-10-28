---
name: uiux-interaction-spec
description: Describe or specify UI interaction and motion precisely from a reference or user request, including trigger, states, movement and outcome. Use for interaction vocabulary, motion handoff, or implementation of a described interface behavior.
---

# Name and specify the interaction

Before selecting a layout, visual language or interaction, identify the intended surface: **marketing/content website**, **mobile app/miniprogram**, or **dashboard / Web UI**. Read [surface routing](references/surface-routing.md) when the request spans categories or the reference could be misclassified. Judge by the product's purpose, task and input context; browser hosting or interactivity does not make a site an app, and an app does not automatically mean a dashboard.

Turn vague requests such as “make it feel lively” into observable behavior that serves a user goal. Inspect any provided reference or existing implementation before naming the pattern. A label is a convenient shorthand, not proof of a universally standardized term; describe the behavior even if no agreed name exists.

For naming requests, return the best-fitting term and a short behavioral explanation. If multiple terms fit, distinguish plausible alternatives. The [Animation Vocabulary](https://animations.dev/vocabulary) is a useful reference when available; its names are a vocabulary, not an exhaustive standard. If the user only asks what an effect is called, answer that question without implementing it.

For each meaningful interaction, specify:

- **Purpose and object:** what the user is doing and which element responds.
- **Trigger and initial state:** click, tap, keyboard, hover, scroll or data change; describe the starting state.
- **Sequence:** what moves or changes, its direction or path, order, and relationship to other elements. Add duration and easing when needed for implementation rather than inventing exact values from a video.
- **Result and reversal:** final state, feedback, what happens on repeated activation or interruption, and whether state persists.
- **Access and fallback:** keyboard and touch behavior, visible focus, reduced-motion alternative, and content or state availability without animation.

Examples of descriptive patterns from the studied material include overlapping avatars that reveal names, progress fill that communicates status, expandable rows, a card tray, a magnifying row, and a pull-to-reveal summary. The same name may refer to different behavior elsewhere: describe the actual reference rather than assuming details.

For a sticker-like interaction, a useful handoff could say: “on activation, the lower-right corner curls, the sticker lifts and rotates slightly, travels into the outlined area, then the corner settles flat.” Adapt this to the actual interface and specify accessible alternatives. If implementing, verify the real states and motion in the rendered UI; report any unverified behavior.
