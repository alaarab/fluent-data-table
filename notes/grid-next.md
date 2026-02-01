# Next implementation steps (grid UX)

## 1) Header actions overlay (keep always visible)
Goal: Actions (sort/filter) visible, but do not force perceived column width.

Approach:
- In ColumnHeaderFilter.module.scss:
  - Make `.columnHeader` position: relative.
  - Make `.headerActions` position: absolute; right: 0; top: 50%; transform: translateY(-50%).
  - Give `.headerContent` padding-right = (actionWidth + gap), e.g. 52px.
  - Ensure buttons remain focusable; ensure hit targets not clipped.

Potential gotchas:
- DataGridHeaderCell has its own padding; must ensure overlay doesn't overlap border/resizer.
- In resizable columns, overlay must not interfere with resize handle; might need `pointer-events` tuning.

## 2) Storybook args/controls for sizing
- Add story variants or controls for:
  - layoutMode: 'fit' | 'content'
  - resizableColumns: boolean
  - autoFitColumns: boolean
  - per-column minWidth/defaultWidth/idealWidth (maybe via a preset selector)

## 3) Column width skew investigation
- Why Status appears wider than Project in some states.
- Hypotheses:
  - header content width influenced by actions
  - Fluent autoFitColumns distributing widths
  - our defaultWidth/minWidth choices

Use GRID_QA.md to validate.
