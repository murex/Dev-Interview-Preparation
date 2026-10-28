# UI and accessibility decisions

- Body text and controls: 16px at the browser’s default root size; topic titles: 17px; labels and metadata: at least 14px. All sizes use `rem` so browser font preferences scale them. These are design choices; WCAG does not prescribe a universal minimum font size.
- Text palette combinations are checked at 4.5:1 or higher. See [WCAG 1.4.3: Contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
- Controls use a 44px minimum target height at the default root size, with 44px icon buttons and clickable labels around checkboxes. This exceeds WCAG 2.2 AA’s 24px minimum for ordinary targets. See [WCAG 2.5.8: Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).
- Visible keyboard focus, a skip link, native modal dialogs, a keyboard-operable mobile menu, and select controls as alternatives to dragging.
- Board columns stack on narrow screens. No font reduction at mobile breakpoints, hidden text via clipping, or restrictions on browser zoom. These changes support [200% text resizing](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) and [reflow at 320 CSS pixels](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).
- Completed tasks retain readable contrast, with a strikethrough and explicit status rather than reduced text opacity. Status and priority have text labels, so meaning does not depend on color.
- Routine edits show their result directly. Errors appear inline; only archive operations offer an undo message. There are no floating success pop-ups or promotional panels.

## Verification

`npm test` checks palette contrast, typography limits, baseline target sizing, zoom configuration, and the application’s data and interaction behavior. The DOM integration tests use a test double, not a browser.

Visual checks at 200% text size and 320 CSS pixels, assistive-technology checks, and a full WCAG conformance audit remain unverified. Passing these automated checks is not a conformance certification.
