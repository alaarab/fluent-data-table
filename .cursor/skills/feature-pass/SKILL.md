---
name: feature-pass
description: Guides the agent through a full feature pass: implement or modify a feature, run Clippy-style dead code cleanup on touched areas, then run tests and build to confirm everything still works. Use when the user says "feature pass" followed by a feature description.
---

# Feature Pass

**Purpose:** Run a complete pass on a feature:

1. Implement or modify the feature.
2. Clean up dead/unused code in the touched area (using Clippy-style rules).
3. Run tests and build to confirm things still work.

## When to Use

Trigger this skill when the user says phrases like:

- "feature pass: add pagination to `FluentDataTable`"
- "feature pass on `DataGridTable` filters for status"
- "run a feature pass for this change"

The text after "feature pass" should briefly describe the feature or change area.

## Workflow

When "feature pass" is invoked, follow this order:

### 1. Understand the Feature

- Identify the main area(s) of the codebase affected (e.g. `FluentDataTable`, `DataGridTable`, related hooks, specific components/services under `src/DataTable`).
- Skim the relevant files to understand current behavior and patterns.
- Keep changes small and focused on the described feature.

### 2. Implement or Modify the Feature

- Make the minimal, clear changes needed to achieve the requested behavior.
- Follow Fluent Data Table project guidelines:
  - TypeScript-first, no new `any`.
  - Match existing patterns in React and Fluent UI components already used in this library.
  - Keep components focused and reasonably small.

### 3. Mow the Lawn (Dead Code Cleanup in Touched Areas)

In the files you modified (and directly related helpers/services):

- Remove **unused imports, variables, and parameters**.
- Remove **dead helpers or exports** that are now unused due to the change.
- Avoid broad, cross-project cleanup; stay close to the feature’s changed files.
- Follow the same safety rules as Clippy:
  - When in doubt, do not delete.
  - Do not change public contracts unless explicitly requested.
  - Respect comments that say to keep code.

If you find obvious, truly dead code directly adjacent to the change (e.g. an old unused branch right next to the new logic), you may trim it and mention it in the summary.

### 4. Run Tests and Build

After code and local cleanup:

- Prefer to run (or at least prepare and suggest) these commands:
  - `npm run test:all` for unit tests.
  - `npm run build` for a dev build.
- If the environment does not allow actually running commands, simulate the intent:
  - Re-scan for TypeScript/lint errors on affected files.
  - Double-check imports, types, and obvious runtime issues.

If failures appear and they are straightforward to fix:

- Fix them as part of the same feature pass.
- Otherwise, describe the failure clearly in the summary.

## Reporting Back to the User

Keep the summary **short and concrete**, focusing on:

- **Feature changes**: what was implemented or modified.
- **Cleanup**: which files had dead code removed (high level only).
- **Validation**:
  - Whether tests/build passed.
  - Any remaining issues or follow-ups needed.

Example summary:

- "Implemented new filter behavior for `DataGridTable` (feature X)."
- "Cleaned unused imports and a dead helper in `useFilterOptions.ts`."
- "`npm run test:all` and `npm run build` are ready to run; no new type or lint issues detected in touched files."

