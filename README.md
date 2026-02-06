# @alaarab/fluent-data-table

A full-featured data grid for React, built on [Fluent UI DataGrid](https://react.fluentui.dev/?path=/docs/components-datagrid--default). Sort, filter (text, multi-select, people), paginate, show/hide columns, resize columns, and export to CSV. Use an in-memory array or plug in your own API.

## Features

- **Sorting** - Click column headers to sort ascending/descending; optional **default sort** (`defaultSortBy` / `defaultSortDirection`) on load
- **Filtering** - Three filter types: text search, multi-select checkboxes, people picker
- **Pagination** - Configurable page sizes with first/prev/next/last navigation
- **Column Visibility** - Show/hide columns via a dropdown chooser
- **Resizable Columns** - Drag column borders to resize; **layout mode** (`content` vs `fill`) and per-column **sizing** (`minWidth`, `defaultWidth`, `idealWidth`)
- **Empty state** - Custom message or full custom content when no results (`emptyStateMessage` / `emptyStateRender` or `emptyState.message` / `emptyState.render`)
- **CSV Export** - Export visible or all data to CSV
- **Generic Types** - Works with any data type `<T>`
- **Data source pattern** - Pass `data` (array) for client-side or `dataSource` (IDataSource) for server-side; unified `filters` object; optional controlled state

### Accessibility & best practices (Fluent DataGrid)

This component follows [Fluent UI DataGrid best practices](https://react.fluentui.dev/?path=/docs/components-datagrid--default):

- **Always include a header row** – The grid always renders `DataGridHeader`.
- **Accessible name** – Use `aria-label` on the grid when there is no visible label, or `aria-labelledby` when preceded by a heading. Pass these to `DataGridTable` as `aria-label` / `aria-labelledby`.
- **Min-width** – Column and table min-widths are set so the grid displays correctly at high zoom and on small screens; when columns don’t fit, the table scrolls horizontally so you can reach the last columns.
- **Wide tables** – When total column min-width exceeds the container, the grid uses horizontal overflow (scroll) and the last column’s resize handle is available; when the table fits, the last resize handle is hidden to avoid empty space.

## Installation

Install from npm:

```bash
npm install @alaarab/fluent-data-table
```

### Peer Dependencies

```json
{
  "@fluentui/react-components": "^9.0.0",
  "@fluentui/react-icons": "^2.0.0",
  "react": "^17.0.0 || ^18.0.0",
  "react-dom": "^17.0.0 || ^18.0.0"
}
```

## Quick Start

Pass **`data`** (an array) for client-side—sort, filter, and paginate in memory. Or pass **`dataSource`** for server-side—the grid calls your API for each page.

### Client-side

```tsx
import { FluentDataTable, type IColumnDef } from '@alaarab/fluent-data-table';

interface IProduct {
  id: string;
  name: string;
  category: string;
  price: number;
}

const columns: IColumnDef<IProduct>[] = [
  { columnId: 'name', name: 'Name', sortable: true, filterable: { type: 'text' }, renderCell: (item) => <span>{item.name}</span> },
  { columnId: 'category', name: 'Category', sortable: true, filterable: { type: 'multiSelect', filterField: 'category' }, renderCell: (item) => <span>{item.category}</span> },
  { columnId: 'price', name: 'Price', sortable: true, renderCell: (item) => <span>${item.price.toFixed(2)}</span> },
];

function ProductTable() {
  const [items] = useState<IProduct[]>(/* your data */);
  return (
    <FluentDataTable<IProduct>
      data={items}
      columns={columns}
      getRowId={(r) => r.id}
      entityLabelPlural="products"
    />
  );
}
```

Multi-select filter options are derived from your data automatically.

### Server-side

```tsx
const dataSource: IDataSource<IProduct> = {
  async fetchPage(params) {
    const res = await fetch(`/api/products?page=${params.page}&pageSize=${params.pageSize}&sort=${params.sort?.field}&dir=${params.sort?.direction}`);
    return res.json(); // { items: IProduct[], totalCount: number }
  },
  async fetchFilterOptions(field) {
    const res = await fetch(`/api/products/distinct/${field}`);
    return res.json(); // string[]
  },
};

<FluentDataTable<IProduct>
  dataSource={dataSource}
  columns={columns}
  getRowId={(r) => r.id}
  entityLabelPlural="products"
/>
```

For URL sync or a custom toolbar, use **controlled** props: `page`, `sort`, `filters`, and the `on*` callbacks (see [API Reference](#api-reference)). For full control, use `DataGridTable`, `PaginationControls`, and `ColumnChooser` with your own state and `toDataGridFilterProps(filters)`.

## Customizing

### Layout and sizing

- **`layoutMode`** (FluentDataTable and DataGridTable): `'content'` (default) or `'fill'`.
  - **`content`** – Grid shrinks to content; no giant last column or trailing blank space. Good when the table is narrow or you have few columns.
  - **`fill`** – Grid fills the container; traditional full-width table. Good when you want columns to share remaining width.

- **Column sizing** (per column in `IColumnDef`): `minWidth`, `defaultWidth`, `idealWidth`.
  - **`minWidth`** – Minimum allowed width (default 80). Used at high zoom and for horizontal scroll.
  - **`defaultWidth`** – Initial width (default 120).
  - **`idealWidth`** – Preferred width for auto-fit. Omit to use `defaultWidth`.

### Initial sort (FluentDataTable)

- **`defaultSortBy`** – Column ID for initial sort. Omit to use the first column.
- **`defaultSortDirection`** – `'asc'` (default) or `'desc'`.

Example: sort by Budget descending on load:

```tsx
<FluentDataTable<Project>
  data={projects}
  columns={columns}
  getRowId={(r) => r.id}
  defaultSortBy="budget"
  defaultSortDirection="desc"
  entityLabelPlural="projects"
/>
```

### Empty state

When there are no rows, you can customize the message or replace the whole block.

- **FluentDataTable**: pass `emptyState={{ message: '...' }}` for custom text, or `emptyState={{ render: () => <div>...</div> }}` for full control (e.g. "Create item" button).
- **DataGridTable** (when using the grid directly): `emptyState.message` or `emptyState.render`. Same meaning.

Example – custom empty message:

```tsx
<FluentDataTable<Project>
  ...
  emptyState={{ message: 'No projects yet. Create one to get started.' }}
/>
```

Example – custom empty block with action:

```tsx
<FluentDataTable<Project>
  ...
  emptyState={{
    render: () => (
      <div>
        <p>No projects match your filters.</p>
        <button onClick={onClearFilters}>Clear filters</button>
        <button onClick={onCreate}>Create project</button>
      </div>
    ),
  }}
/>
```

### Other FluentDataTable props

- **`title`** – Optional React node above the grid (e.g. `<h2>Projects</h2>`).
- **`toolbar`** – Optional React node (e.g. export button) next to the column chooser.
- **`className`** – CSS class on the wrapper.
- **`defaultPageSize`** – Uncontrolled: initial rows per page (default 20). Page size options are 10, 20, 50, 100.
- **`entityLabelPlural`** – Label for pagination text (e.g. "Showing 1 to 10 of 50 **projects**"). Default `"items"`.

For the full list of props (including controlled `page`, `sort`, `filters`, and callbacks), see the [API Reference](#api-reference) below.

<details>
<summary>DataGridTable + low-level state (server-side, full control)</summary>

For URL sync, custom toolbar, or full control over state, use `DataGridTable` with your own state. Implement **`IDataSource<T>`** with `fetchPage(IFetchParams)` and use **`toDataGridFilterProps(filters)`** to pass filter state to the grid.

```tsx
import {
  DataGridTable,
  PaginationControls,
  ColumnChooser,
  useFilterOptions,
  toDataGridFilterProps,
  type IColumnDef,
  type IDataSource,
  type IFilters,
} from '@alaarab/fluent-data-table';

interface IProduct {
  id: string;
  name: string;
  category: string;
  price: number;
}

const columns: IColumnDef<IProduct>[] = [ /* ... */ ];

const dataSource: IDataSource<IProduct> = {
  async fetchPage(params) {
    const response = await fetch(`/api/products?page=${params.page}&pageSize=${params.pageSize}&...`);
    return response.json(); // { items: IProduct[], totalCount: number }
  },
  async fetchFilterOptions(field) {
    const response = await fetch(`/api/products/distinct/${field}`);
    return response.json(); // string[]
  },
};

// 3. Use in your component
function ProductTable() {
  const [items, setItems] = useState<IProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState<string>();
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<IFilters>({});
  const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.columnId)));
  const { multiSelectFilters, textFilters, peopleFilters } = toDataGridFilterProps(filters);

  const { filterOptions, loadingOptions } = useFilterOptions(dataSource, ['category']);

  useEffect(() => {
    dataSource.fetchPage({ page, pageSize, sort: sortBy ? { field: sortBy, direction: sortDirection } : undefined, filters })
      .then(({ items, totalCount }) => {
        setItems(items);
        setTotalCount(totalCount);
      });
  }, [page, pageSize, sortBy, sortDirection, filters]);

  return (
    <>
      <ColumnChooser
        columns={columns}
        visibleColumns={visibleColumns}
        onVisibilityChange={(col, visible) => {
          setVisibleColumns(prev => {
            const next = new Set(prev);
            visible ? next.add(col) : next.delete(col);
            return next;
          });
        }}
      />

      <DataGridTable
        items={items}
        columns={columns}
        getRowId={(item) => item.id}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onColumnSort={(col) => {
          if (sortBy === col) setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
          else { setSortBy(col); setSortDirection('asc'); }
        }}
        visibleColumns={visibleColumns}
        multiSelectFilters={multiSelectFilters}
        onMultiSelectFilterChange={(key, values) => setFilters(prev => ({ ...prev, [key]: values.length ? values : undefined }))}
        textFilters={textFilters}
        onTextFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value || undefined }))}
        peopleFilters={peopleFilters}
        onPeopleFilterChange={(key, user) => setFilters(prev => ({ ...prev, [key]: user }))}
        filterOptions={filterOptions}
        loadingFilterOptions={loadingOptions}
      />

      <PaginationControls
        currentPage={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </>
  );
}
```

</details>

## Connecting to your API (server-side)

- **Implement `IDataSource<T>`**: your adapter around whatever backend you use (REST, Graph, etc.). Implement `fetchPage(params: IFetchParams)` and optionally `fetchFilterOptions(field)`, `searchPeople(query)`, `getUserByEmail(email)`.
- **`IFetchParams`** includes `page`, `pageSize`, `sort?: { field, direction }`, and **`filters: IFilters`** (unified: text = string, multi-select = string[], people = UserLike).
- **Return `{ items, totalCount }`**: `items` is the current page of rows, `totalCount` is the total so pagination can be computed.

Example shape:

```ts
const dataSource: IDataSource<Project> = {
  async fetchPage({ page, pageSize, sort, filters }) {
    const f = filters || {};
    const query = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sortBy: sort?.field ?? '',
      sortDirection: sort?.direction ?? 'asc',
      status: Array.isArray(f.status) ? f.status.join(',') : '',
    });

    const res = await fetch(`/api/projects?${query.toString()}`);
    return res.json(); // { items: Project[], totalCount: number }
  },
};
```

For low-level control (e.g. URL sync), use `DataGridTable` + `PaginationControls` with your own state and `toDataGridFilterProps(filters)` to pass filter state to the grid.

## Filtering patterns

- **Text filters**
  - Use `filterable: { type: 'text', filterField?: string }` on a column.
  - `filterField` is the key you send to your API; if omitted it defaults to `columnId`.
  - The grid calls `onTextFilterChange(filterField, value)` when the user applies the text filter.

- **Multi-select filters**
  - Use `filterable: { type: 'multiSelect', filterField?: string, optionsSource?: 'api' | 'static' | 'years', options?, yearsCount? }`.
  - Provide options via:
    - `optionsSource: 'static'` + `options: string[]`, or
    - `optionsSource: 'api'` + `fetchFilterOptions(field)` on your `IDataSource`, or
    - `optionsSource: 'years'` + `yearsCount` for a recent-years list.
  - The grid calls `onMultiSelectFilterChange(filterField, values)` with the selected values.

- **People filters**
  - Use `filterable: { type: 'people' }` for a people picker column.
  - Implement `searchPeople(query)` and optionally `getUserByEmail(email)` on your `IDataSource`.
  - The grid will call `onPeopleFilterChange(filterField, user | undefined)` when the user selects or clears a person.

## Pagination behavior

- `PaginationControls`:
  - Computes `totalPages = ceil(totalCount / pageSize)`.
  - Shows a sliding window of up to 5 page buttons.
  - Adds leading/trailing **ellipses** when there are many pages, always including first/last page buttons.
  - Emits `onPageChange(nextPage)` and `onPageSizeChange(nextPageSize)`; the grid itself is controlled by your state.

## Styling & theming

- Components use **SCSS modules** for styling (e.g. `DataGridTable.module.scss`).
- You can:
  - Override styles by wrapping the grid/controls in containers with your own classes.
  - Fork the SCSS modules in this package if you want a custom theme and publish a themed variant.
- Consumers must have a build pipeline that understands `.scss` (SPFx already does); JS is tree-shakable but SCSS files are marked as side-effectful so they’re preserved.

### Emphasizing a column (e.g. bold)

The grid does not bold any column by default. To emphasize a column (e.g. make it bold), use `renderCell` to return styled content:

```tsx
{
  columnId: 'name',
  name: 'Name',
  renderCell: (item) => <strong>{item.name}</strong>,
}
```

Or return a span with a class and style it via your own CSS.

## API Reference

### Components

#### `FluentDataTable<T>`

Full table with column chooser, filters, and pagination. Use **`data`** for client-side (in-memory) or **`dataSource`** for server-side. State is uncontrolled by default; pass `page`, `sort`, `filters`, etc. for controlled mode.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `columns` | `IColumnDef<T>[]` | Yes | Column definitions |
| `getRowId` | `(item: T) => string` | Yes | Function to get unique row ID |
| `data` | `T[]` | One of data/dataSource | Client-side: array; grid filters/sorts/pages in memory. Multi-select options derived from data. |
| `dataSource` | `IDataSource<T>` | One of data/dataSource | Server-side: implement `fetchPage`, optionally `fetchFilterOptions`, `searchPeople`, `getUserByEmail`. |
| `page` | `number` | No | Controlled: current page (1-based). Omit for uncontrolled. |
| `pageSize` | `number` | No | Controlled: page size. Omit for uncontrolled. |
| `sort` | `{ field: string; direction: 'asc' \| 'desc' }` | No | Controlled: sort. Omit for uncontrolled. |
| `filters` | `IFilters` | No | Controlled: unified filters (text = string, multi-select = string[], people = UserLike). Omit for uncontrolled. |
| `visibleColumns` | `Set<string>` | No | Controlled: visible column IDs. Omit for uncontrolled. |
| `onPageChange` | `(page: number) => void` | No | Called when page changes. |
| `onPageSizeChange` | `(size: number) => void` | No | Called when page size changes. |
| `onSortChange` | `(sort: { field: string; direction: 'asc' \| 'desc' }) => void` | No | Called when sort changes. |
| `onFiltersChange` | `(filters: IFilters) => void` | No | Called when filters change. |
| `onVisibleColumnsChange` | `(cols: Set<string>) => void` | No | Called when column visibility changes. |
| `defaultPageSize` | `number` | No | Uncontrolled: initial page size. Default `20`. |
| `defaultSortBy` | `string` | No | Uncontrolled: initial sort column. Omit to use first column. |
| `defaultSortDirection` | `'asc' \| 'desc'` | No | Uncontrolled: initial sort direction. Default `'asc'`. |
| `toolbar` | `React.ReactNode` | No | Optional toolbar (e.g. export button) next to column chooser. |
| `emptyState` | `{ message?: React.ReactNode; render?: () => React.ReactNode }` | No | Custom empty state: `message` = text; `render` = full content. |
| `entityLabelPlural` | `string` | No | Label for pagination (e.g. "projects"). Default `"items"`. |
| `title` | `React.ReactNode` | No | Optional title above the grid. |
| `className` | `string` | No | CSS class on the wrapper. |
| `layoutMode` | `'content' \| 'fill'` | No | `content` = shrink to content; `fill` = fill container. Default `'content'`. |
| `aria-label` | `string` | No | Accessible name when no visible label. |
| `aria-labelledby` | `string` | No | ID of element that labels the grid. |

#### `DataGridTable<T>`

The main data grid component with sorting and filtering built into column headers. Use with **server-side** data or when you need full control over state.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `items` | `T[]` | Yes | Array of data items to display |
| `columns` | `IColumnDef<T>[]` | Yes | Column definitions |
| `getRowId` | `(item: T) => string` | Yes | Function to get unique row ID |
| `sortBy` | `string` | No | Currently sorted column ID |
| `sortDirection` | `'asc' \| 'desc'` | Yes | Sort direction |
| `onColumnSort` | `(columnKey: string) => void` | Yes | Called when user clicks sort |
| `visibleColumns` | `Set<string>` | No | Set of visible column IDs |
| `layoutMode` | `'content' \| 'fill'` | No | `content` = shrink to content; `fill` = fill container. Default `'content'` |
| `multiSelectFilters` | `Record<string, string[]>` | Yes | Multi-select filter state |
| `onMultiSelectFilterChange` | `(key: string, values: string[]) => void` | Yes | Multi-select change handler |
| `textFilters` | `Record<string, string>` | No | Text filter state |
| `onTextFilterChange` | `(key: string, value: string) => void` | No | Text filter change handler |
| `peopleFilters` | `Record<string, UserLike \| undefined>` | No | People filter state |
| `onPeopleFilterChange` | `(key: string, user: UserLike \| undefined) => void` | No | People filter change handler |
| `filterOptions` | `Record<string, string[]>` | Yes | Available options per filter field |
| `loadingFilterOptions` | `Record<string, boolean>` | Yes | Loading state per filter field |
| `peopleSearch` | `(query: string) => Promise<UserLike[]>` | No | People search function |
| `getUserByEmail` | `(email: string) => Promise<UserLike \| undefined>` | No | Lookup user by email |
| `isLoading` | `boolean` | No | Show loading overlay over the grid (e.g. server-side refresh) |
| `loadingMessage` | `string` | No | Message shown in loading overlay. Default `"Loading…"`. |
| `emptyState` | `{ onClearAll: () => void; hasActiveFilters: boolean; message?: React.ReactNode; render?: () => React.ReactNode }` | No | Empty state: `message` = custom text; `render` = custom content |
| `aria-label` | `string` | No | Accessible name when no visible label |
| `aria-labelledby` | `string` | No | ID of element that labels the grid (e.g. heading) |

#### `ColumnChooser`

Dropdown to toggle column visibility.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `columns` | `IColumnDefinition[]` | Yes | List of all columns |
| `visibleColumns` | `Set<string>` | Yes | Currently visible column IDs |
| `onVisibilityChange` | `(columnKey: string, visible: boolean) => void` | Yes | Visibility toggle handler |
| `className` | `string` | No | Additional CSS class |

#### `PaginationControls`

Pagination UI with page numbers and size selector.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `currentPage` | `number` | Yes | Current page (1-indexed) |
| `pageSize` | `number` | Yes | Items per page |
| `totalCount` | `number` | Yes | Total number of items |
| `onPageChange` | `(page: number) => void` | Yes | Page change handler |
| `onPageSizeChange` | `(pageSize: number) => void` | Yes | Page size change handler |
| `entityLabelPlural` | `string` | No | Label in "Showing X to Y of Z **items**". Default `"items"` |
| `className` | `string` | No | Additional CSS class |

#### `ColumnHeaderFilter`

Column header with sort indicator and filter popover. Used internally by `DataGridTable`.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `columnKey` | `string` | Yes | Column identifier |
| `columnName` | `string` | Yes | Display name |
| `filterType` | `ColumnFilterType` | Yes | `'none' \| 'text' \| 'multiSelect' \| 'people'` |
| `isSorted` | `boolean` | No | Whether column is sorted |
| `isSortedDescending` | `boolean` | No | Sort direction if sorted |
| `onSort` | `() => void` | No | Sort click handler |
| ... | | | See source for full props |

### Hooks

#### `useFilterOptions(dataSource, fields)`

Loads filter options for multi-select columns. Accepts **`IDataSource<T>`** or any object with **`fetchFilterOptions(field)`**. No adapter needed.

```tsx
const { filterOptions, loadingOptions } = useFilterOptions(dataSource, ['status', 'category']);
// filterOptions = { status: ['Active', 'Closed'], category: ['A', 'B'] }
// loadingOptions = { status: false, category: false }
```

### Types

#### `IDataSource<T>` (recommended)

Data source interface for server-side data. Use with `FluentDataTable` via `dataSource` or with your own state + `DataGridTable`.

```typescript
interface IDataSource<T> {
  fetchPage(params: IFetchParams): Promise<IPageResult<T>>;
  fetchFilterOptions?(field: string): Promise<string[]>;
  searchPeople?(query: string): Promise<UserLike[]>;
  getUserByEmail?(email: string): Promise<UserLike | undefined>;
}
```

#### `IFetchParams`

Parameters passed to `fetchPage()`.

```typescript
interface IFetchParams {
  page: number;
  pageSize: number;
  sort?: { field: string; direction: 'asc' | 'desc' };
  filters: IFilters;
}
```

#### `IFilters`

Unified filter values: text (string), multi-select (string[]), or people (UserLike). One object instead of three separate maps.

```typescript
interface IFilters {
  [field: string]: string | string[] | UserLike | undefined;
}
```

#### `IPageResult<T>`

Return type of `fetchPage()`.

```typescript
interface IPageResult<T> {
  items: T[];
  totalCount: number;
}
```

#### `toDataGridFilterProps(filters)`

Splits `IFilters` into the three props expected by `DataGridTable`: `multiSelectFilters`, `textFilters`, `peopleFilters`. Use when you hold unified `filters` state and pass to the grid.

```typescript
import { toDataGridFilterProps } from '@alaarab/fluent-data-table';
const { multiSelectFilters, textFilters, peopleFilters } = toDataGridFilterProps(filters);
```

#### `IColumnDef<T>`

Full column definition including render function.

```typescript
interface IColumnDef<T> {
  columnId: string;
  name: string;
  sortable?: boolean;
  filterable?: false | IColumnFilterDef;
  defaultVisible?: boolean;
  required?: boolean;           // Cannot be hidden via ColumnChooser
  minWidth?: number;
  defaultWidth?: number;
  idealWidth?: number;
  renderCell?: (item: T) => React.ReactNode;
  compare?: (a: T, b: T) => number;
}
```

#### `IColumnFilterDef`

Filter configuration for a column.

```typescript
interface IColumnFilterDef {
  type: 'text' | 'multiSelect' | 'people';
  filterField?: string;         // API field name (defaults to columnId)
  optionsSource?: 'api' | 'static' | 'years';
  options?: string[];           // For static options
  yearsCount?: number;          // For 'years' optionsSource
}
```

#### `UserLike`

Minimal user shape for people picker columns.

```typescript
interface UserLike {
  id?: string;
  displayName: string;
  email: string;
  photo?: string;
}
```

### CSV Export Utilities

```typescript
import { buildCsvHeader, buildCsvRows, triggerCsvDownload, exportToCsv } from '@alaarab/fluent-data-table';

// Export current page
exportToCsv(items, columns, (item, colId) => item[colId], 'export.csv');

// Or build manually for streaming/all pages
const header = buildCsvHeader(columns);
const rows = buildCsvRows(items, columns, getValue);
const csv = [header, ...rows].join('\n');
triggerCsvDownload(csv, 'export.csv');
```

## File Structure

```
DataTable/
├── index.ts                      # Public exports
├── dataGridTypes.ts              # IDataSource, IFetchParams, IFilters, IPageResult, toDataGridFilterProps, UserLike
├── columnTypes.ts                # IColumnDef, IColumnFilterDef, IColumnMeta
├── exportToCsv.ts                # CSV export utilities
├── DataGridTable/
│   ├── DataGridTable.tsx         # Main grid component
│   └── DataGridTable.module.scss
├── ColumnHeaderFilter/
│   ├── ColumnHeaderFilter.tsx    # Header with sort/filter
│   ├── ColumnHeaderFilter.module.scss
│   └── index.ts
├── ColumnChooser/
│   ├── ColumnChooser.tsx         # Column visibility dropdown
│   └── ColumnChooser.module.scss
├── PaginationControls/
│   ├── PaginationControls.tsx    # Pagination UI
│   └── PaginationControls.module.scss
├── hooks/
│   ├── useFilterOptions.ts       # Hook to load filter options
│   └── __tests__/
│       └── useFilterOptions.test.ts
└── __tests__/
    └── exportToCsv.test.ts
```

## Storybook

Run Storybook locally to try the grid and all customization options:

```bash
npm run storybook
```

- **DataTable/FluentDataTable** – Default, Empty, Small/Large data, **Default sort** (e.g. Budget desc), **With CSV Export**, Ten/Twenty columns.
- **DataTable/FluentDataTable → Playground** – Interactive controls for **layoutMode** (content vs fill), **container width**, **row count**, **page size**, **defaultSortBy** / **defaultSortDirection**, and per-column sizing.
- **DataTable/DataGridTable** – Default, Empty, Empty with filters, **Loading filter options**, **Wide table with horizontal scroll**, With people filter.
- **DataTable/ColumnHeaderFilter** – No filter, Text, MultiSelect, People, Sorted asc/desc, With active filter badge.
- **DataTable/ColumnChooser** – Default, Many columns, Some hidden.
- **DataTable/PaginationControls** – Default, First page, Many pages, Single page.

Use the **Theme** toolbar (Light/Dark) and **Viewport** (e.g. Desktop narrow 1024px, Desktop wide 1440px) to QA layout and theming.

## Development

- **Build:** `npm run build` (TypeScript → `dist/esm`, types → `dist/types`, SCSS compiled).
- **Test:** `npm test`
- **Storybook:** `npm run storybook` to try the grid and all options.
- **Publish:** `npm publish --access public`

## Troubleshooting

- **Nothing renders / grid is blank**
  - Check you’re passing `items`, `columns`, and a working `getRowId`.
  - Ensure `visibleColumns` contains the `columnId`s you expect.

- **Filters don’t affect data**
  - Verify your `IDataSource.fetchPage` uses `params.filters` and `params.sort`.
  - Ensure your filter handlers (`onMultiSelectFilterChange`, `onTextFilterChange`, `onPeopleFilterChange`) actually update the state you pass back into the grid.

- **CSV export downloads an empty file**
  - Confirm you’re passing the same `columns`/`items` that the grid sees.
  - Check your `getValue(item, columnId)` implementation and whether some values are `null`/`undefined` (they become empty strings).

## Design Decisions

### Why data source pattern?

The **`IDataSource<T>`** abstraction keeps the grid agnostic of your API:
- Grid doesn't know about REST, GraphQL, or local data
- Host implements `fetchPage(IFetchParams)` and maps `filters` (IFilters) to your API
- One **unified `filters`** object (text, multi-select, people) instead of three separate state maps
- Easy to swap backends or add caching; testable with mock data sources

### Why Controlled State?

All filter/sort/pagination state is controlled by the host:
- Enables URL sync (bookmarkable filters)
- Supports undo/redo
- Allows state persistence
- Works with any state management

### Column Sizing

Columns support three sizing properties:
- `minWidth` - Minimum allowed width
- `defaultWidth` - Initial width
- `idealWidth` - Preferred width for auto-fit

## License

MIT

