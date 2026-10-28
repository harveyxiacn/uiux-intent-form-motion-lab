---
name: uiux-mobile-patterns
description: Design or refine handheld app and miniprogram task flows, including navigation,
  safe areas, touch, sheets, keyboard and return paths. Use for mobile app behavior;
  not merely for a narrow marketing webpage.
---

# Handheld task flows

Identify whether the target is native, a miniprogram, mobile web or a browser prototype. Inspect platform conventions and existing navigation. Browser execution does not disqualify a mobile prototype, but a narrow desktop Dashboard does not demonstrate a mobile app flow.

Map primary destinations and subordinate tasks. Preserve destination state when appropriate, provide a clear return path from details, and distinguish navigation from prominent actions. Bottom navigation is an option for peer destinations, not a mandatory decoration or a place for every command.

Design for touch and interruptions: reachable actions, clear selected and pressed states, alternatives to swipes/long press, and prevention or recovery for accidental destructive actions. Use appropriate native controls when available. Do not apply hover-only disclosure or globally disable text selection and zoom.

Handle safe areas, browser chrome, dynamic viewport height, scrolling, keyboard occlusion and focused inputs. A bottom sheet needs a clear title, dismissal and focus policy; whether it is modal depends on the task, not its visual shape. Restore context after save/cancel and preserve unfinished input according to the product's requirements.

Show useful empty, loading, offline/error and completed states where relevant. Keep sample state distinct from real backend capability. Confirm persistence scope rather than implying local storage syncs across devices.

Validate the smallest supported viewport, long text, keyboard opening, back navigation and touch scrolling. Use real hardware when available; explicitly distinguish desktop emulation from device testing. Follow platform-specific documentation for native implementations instead of importing web CSS rules.

Example acceptance: opening an item, editing it in a sheet and returning preserves the selected date and filter; the on-screen keyboard does not cover the save action or focused field.
