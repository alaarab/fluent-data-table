# FluentDataTable: Full App Review and Improvement Plan

## Current Architecture (Summary)

Your app is a well-structured Fluent UI DataGrid-based table package with:

- **FluentDataTable** – client-side all-in-one (sort, filter, paginate, column chooser).
- **DataGridTable** – core grid with header filters (text, multiSelect, people), resizable columns, layout modes (content | fill), empty state.
- **ColumnChooser**, **PaginationControls**, **ColumnHeaderFilter** – composable UI.
- **IDataGridDataSource** – server-side adapter; **useFilterOptions** for API-driven filter options.
- **exportToCsv** – CSV build and download.

Data flow: [FluentDataTable state] → filtered/sorted → paged → [DataGridTable]. Server-side: host holds state and calls dataSource.getPage(params).

---

**Completed (removed from this doc):** Datatable improvements (sort handler, filters type, empty state, default sort), test improvements (fixtures, FluentDataTable/DataGridTable/ColumnHeaderFilter/ColumnChooser/PaginationControls/useFilterOptions/exportToCsv, integration test, package.json scripts), Storybook improvements (ColumnHeaderFilter stories, FluentDataTable/DataGridTable stories, Playground defaultSort, docs, dark theme, viewports).

---

## 4. AgGrid-Style Features (Priority Order)

These would move FluentDataTable toward a "super useful" datatable solution comparable to AgGrid/TanStack Table.

### Tier 1 – Highest impact

| Feature | Description | Complexity |
|--------|-------------|------------|
| **Row selection** | Checkbox column + "select all" header; selectedRowIds: Set<string>, onSelectionChange. Enables "bulk actions" (delete, export selected). Obviously optional. | Medium |
| **Column reorder** | Drag-and-drop column headers to reorder. Persist order in state or via callback. Fluent Table may support or need a wrapper. | Medium |
| **Infinite / server-driven scroll** | Optional "load more" or infinite scroll using IDataGridDataSource.getPage with page incrementing as user scrolls. Keeps client simple for large lists. | Medium |

### Tier 2 – Strong value

| Feature | Description | Complexity |
|--------|-------------|------------|
| **Column pinning** | Pin columns left (or right) so they stay visible when scrolling horizontally. State: pinnedLeftColumns: string[]. | Medium–High |
| **Loading / skeleton state** | Prop loading?: boolean (and optional skeletonRowCount) to show skeleton rows instead of body. Fits server-side fetch. | Low |

### Tier 3 – Completeness

| Feature | Description | Complexity |
|--------|-------------|------------|
| **Keyboard nav** | Arrow keys to move focus between cells/rows; Enter to expand or select. | Medium |
