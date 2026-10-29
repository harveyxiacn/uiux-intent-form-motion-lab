# Handoff artifacts

Short templates for the artifact each stage passes on. Fill only the fields the task needs; mark every line as fact, choice or assumption when it is not obvious.

## 1. Brief — `uiux-page-planning`

```text
Surface:        website | app / miniprogram | Dashboard / Web UI
Audience & situation:
Primary task / action:
Ordered regions:  1. …  2. …  3. …
Required states:  empty · loading · error · success (only the relevant ones)
Constraints (fact):
Assumptions:
```

## 2. Direction — `uiux-style-direction`

```text
Intent (one sentence):
Composition:      what the first screen shows, in what order
Type:             families, scale steps actually used
Color roles:      surface · text · muted · accent (what accent is reserved for)
Imagery / material:
Visible checks:   decision → what a screenshot must show
```

## 3. Token map — `uiux-design-system`

```text
Role            Light     Dark      Used by
--surface       …         …         page, sheet
--text          …         …
--muted         …         …         contrast: x.x:1 / x.x:1
--accent        …         …         primary action only
--danger        …         …         destructive affordance only
Themes supported:
Exceptions (intentional):
```

## 4. Interaction contract — `uiux-interaction-spec`

```text
Purpose & object:
Trigger(s):       pointer · touch · keyboard (all paths)
Sequence:         ordered changes; durations marked "proposed" or "measured"
Result & reversal: final state, undo / cancel, repeat activation, interruption
Access & fallback: focus, announcement, reduced motion, gesture alternative
```

## 5. Component contract — `uiux-component-engineering`

```text
Component:        name, slots
State owner:      who owns data vs. transient UI state
Events:           emitted / handled
State matrix:     idle · focus · active · disabled · loading · error · …
Focus policy:     entry, after removal, after dismiss
```

## 6. Motion evidence — `uiux-motion-engineering`

```text
Timings (proposed): name → ms, easing
Interruption:       reverse | retarget | queue | ignore
Reduced motion:     what remains (state + feedback), what is removed (travel)
Verified:           normal · rapid repeat · reverse · unmount · reduced motion
Not verified:       e.g. low-end device frame timing
```

## 7. Handheld check — `uiux-mobile-patterns`

```text
Reach:              primary actions inside the thumb zone?
Safe areas:         top / bottom insets respected?
Gesture alternatives:
Keyboard occlusion:
Return path & preserved state:
Emulated vs. device-tested:
```

## 8. Findings — `uiux-accessibility-review`

```text
#  Task affected   Reproduction   Evidence   Severity   Fix   Retest
…
Untested scope:     screen readers, hardware, zoom levels not checked
```

## 9. Prompt — `uiux-prompt-playbook`

```text
场景 Scene:      from 1 + 2
动作 Action:     from 4 + 5
手感 Feel:       from 6 (proposals, not laws)
边界 Boundary:   from 4, 6, 7
验收 Acceptance: from 8 + each stage's visible checks
```
