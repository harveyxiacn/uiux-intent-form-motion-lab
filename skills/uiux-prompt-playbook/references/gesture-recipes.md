# Gesture recipes

These are the gestures the playground implements. They are interaction recipes, not platform APIs. Each entry names the observable state machine and the parameters used by the prototype; treat the numbers as choices to test, not universal laws.

## Edge back

- **Intent** — drag from the left edge to reveal the previous page; release commits or cancels.
- **Prototype** — 34 px activation strip; distance threshold 34% of the stage width or release velocity above 0.55 px/ms; page follows the finger 1:1.
- **States** — idle → tracking → commit (page exits, then reopens) / cancel (page returns).
- **Alternative** — an explicit back button and `Escape`.
- **Checks** — fast flick commits even below distance; slow short drag cancels; scroll does not start under the finger; reduced motion switches instantly.

## Axis lock

- **Intent** — one card supports both horizontal paging and vertical dismissal without diagonal drift.
- **Prototype** — lock after 12 px of travel; choose the axis only when one component exceeds the other by 6 px; translate at 0.45× finger distance.
- **States** — undecided → horizontal / vertical → release.
- **Checks** — a 12 px diagonal wiggle must not flip the axis repeatedly; horizontal release under 60 px snaps back; vertical dismissal has a visible alternative.

## Catch

- **Intent** — an inertial card can be grabbed at any moment; taking over stops the animation immediately.
- **Prototype** — velocity starts at 7.2 px/frame, decays by 0.94 per frame; `pointerdown` sets holding and cancels the simulated inertia.
- **States** — coasting → held → released with the new velocity.
- **Checks** — the card never continues underneath the finger; release velocity is not accumulated across frames incorrectly; the loop is cleaned up on unmount.

## Escape / slip-off cancel

- **Intent** — a destructive press can be cancelled by sliding off the target.
- **Prototype** — 120% invisible hit area; commit only if the release point is inside the visible button.
- **States** — pressed → inside / outside → commit or cancel.
- **Checks** — moving outside updates the visual state; pointer capture keeps tracking; keyboard activation has the same final state.

## Rubber-band overscroll

- **Intent** — pulling past a boundary feels resisted and returns with a spring.
- **Prototype** — translated distance = `120 × raw / (raw + 120)`; release returns to the boundary; a pull beyond 40 px can trigger refresh.
- **States** — at rest → pulling → released / refreshing.
- **Checks** — no unbounded translation; release always returns to rest; the underlying scroll position is unchanged until the user actually scrolls.

## Projected landing

- **Intent** — while dragging a carousel, the interface predicts the landing card before release.
- **Prototype** — projected index = current index minus the rounded drag offset divided by card width, clamped to the list.
- **States** — settled → dragging with predicted index → settle.
- **Checks** — the indicator and the eventual landing agree; a drag shorter than half a card returns to the same card; the prediction can be cancelled by pulling back.

## Character-level diff

- **Intent** — when a label or number changes, only the characters that changed animate.
- **Prototype** — compare old and new strings character by character; unchanged characters stay still; changed characters fade/slide with a small stagger.
- **States** — before → diff → after.
- **Checks** — screen readers receive the final text once, not a stream of partial updates; the container does not change width in a way that moves unrelated content; reduced motion replaces the character animation with an immediate update.

## Shared invariants

1. **Capture and release** — pointer capture is set on the element that started the gesture and released when the interaction ends.
2. **One axis at a time** — do not let a horizontal drag also scroll the page vertically.
3. **Reversal** — every committed visual state must have a path back, unless the action is explicitly irreversible and confirmed as such.
4. **No invisible blockers** — a closed sheet, menu or overlay must not remain in the hit-testing tree.
5. **Keyboard / explicit control** — every gesture has a visible or focusable alternative.
6. **Reduced motion** — remove travel, preserve feedback and final state.
7. **Cleanup** — cancel animation frames, timers, pointer capture and document-level listeners on unmount.
