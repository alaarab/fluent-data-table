# FluentDataTable Grid QA / Requirements

This doc is the running source-of-truth for what “good” looks like for our grid.

## Goals (UX)
- Professional grid feel: predictable sizing, clean borders, no mystery whitespace.
- Works in both regimes:
  - **Fit mode** (few columns): table looks intentional, no giant dead zone.
  - **Overflow mode** (many columns): horizontal scroll, clean right edge, no header/body mismatch.

## Requirements (keep updating)

### Layout / sizing
1. **No trailing blank space** at the far right of the table.
   - Especially visible in **Ten Columns**.
2. **Header + body right edge must align** (no “header has extra space but cells don’t”).
   - Especially when scrolled fully right in **Twenty Columns**.
3. **Header actions (sort/filter) must not cause columns to look huge**.
   - Actions should remain visible by default (not hover-only).
   - The presence of actions should not introduce “last icon is stranded at far right” awkwardness.
4. **Columns should not redistribute leftover container width into the last column**.
   - Avoid “last column becomes a spacer”.
5. **Horizontal scrollbar appears only when needed**.
   - No bottom scrollbar unless grid content is wider than the viewport.
6. **Overflow behavior**
   - If sum(minWidth + padding) > container, allow horizontal scroll.
   - In overflow mode, table should size to content (no trailing blank space).
7. **Empty / small-data state**
   - When there are few rows (e.g., Large Page Size), the header still looks balanced.
   - No weird column width skew (e.g., Status much wider than Project) unless explicitly configured.

### Resizing
7. Resizable columns should work and feel stable.
8. Resize handles should not visually break borders.
9. Last column resize affordance should not create header-only whitespace.
   - Either disable last-column resize affordance, or ensure body reserves equivalent space.

### Borders / gridlines
10. Right border should be clean (no double border, no missing border).
11. Last column should not have an extra inner border when wrapper provides outer border.

### A11y / interaction
12. Sort buttons remain keyboard accessible and have labels.
13. Filter buttons remain accessible.
14. Column resize remains accessible for non-last columns.

## Test Flow (manual QA)

Run these every time we touch sizing/layout.

### Test matrix
- Stories:
  - DataTable/FluentDataTable
    - Default
    - Empty
    - Small Data Set
    - Large Page Size
    - Ten Columns
    - Twenty Columns
  - DataTable/DataGridTable (if present)

- Viewports:
  - Desktop wide (~1440px)
  - Desktop narrow (~1024px)

### Steps
1. **Baseline render**
   - Load story, wait for fonts/layout to settle.
   - Visually inspect header alignment, borders, and action placement.
   - Verify border hugs the grid (no large empty bordered region to the right).

2. **Horizontal scroll tests** (Ten Columns + Twenty Columns)
   - Scroll fully right.
   - Verify:
     - no trailing blank space
     - right edge looks “closed” (header/body align)
     - last visible column doesn’t look different from body

3. **Small-data awkwardness** (Large Page Size)
   - With few rows visible, check:
     - header actions don’t look stranded
     - columns don’t look wildly disproportionate

4. **Empty state** (Empty)
   - Verify empty presentation doesn’t cause weird widths.

5. **Resizing**
   - Drag-resize a middle column wider/narrower.
   - Verify:
     - resize is smooth
     - widths persist during interaction
     - borders stay aligned

6. **Keyboard**
   - Tab into header actions (sort/filter).
   - Ensure focus outlines are visible and not clipped.

## Known issues / Open questions
- Header actions currently participate in layout; plan is to switch to an overlay approach so actions are visible without forcing column width.
- Need Storybook args/controls for:
  - per-column sizing (min/default/ideal)
  - layout mode (fit vs content vs overflow)
  - resizableColumns and autoFitColumns toggles

## Changelog (keep short)
- 2026-01-31: Hide resize handle on last header cell to prevent header-only extra space.
- 2026-01-31: Make grid shrink-to-fit content and move border from wrapper → grid to eliminate empty bordered area on the right.
