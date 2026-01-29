# @alaarab/fluent-data-table

Full-featured, generic data table component built on [Fluent UI DataGrid](https://react.fluentui.dev/?path=/docs/components-datagrid--default). Supports sorting, filtering (text, multi-select, people picker), pagination, column visibility, resizable columns, and CSV export.

## Features

- **Sorting** - Click column headers to sort ascending/descending
- **Filtering** - Three filter types: text search, multi-select checkboxes, people picker
- **Pagination** - Configurable page sizes with first/prev/next/last navigation
- **Column Visibility** - Show/hide columns via a dropdown chooser
- **Resizable Columns** - Drag column borders to resize
- **CSV Export** - Export visible or all data to CSV
- **Generic Types** - Works with any data type `<T>`
- **Data Source Pattern** - Host provides `IDataGridDataSource<T>` adapter for API integration

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

Use **`<FluentDataTable />`** for client-side data (in-memory list). It includes the grid, column chooser, filters, and pagination in one component.

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
      items={items}
      columns={columns}
      getRowId={(r) => r.id}
      filterOptions={{ category: ['A', 'B', 'C'] }}
      entityLabelPlural="products"
    />
  );
}
```

For server-side data or full control, use `DataGridTable`, `ColumnChooser`, and `PaginationControls` with your own state and `IDataGridDataSource<T>`. See [src/DataTable/README.md](src/DataTable/README.md) for the full API.

<details>
<summary>DataGridTable + IDataGridDataSource (server-side)</summary>

```tsx
import {
  DataGridTable,
  PaginationControls,
  ColumnChooser,
  useFilterOptions,
  type IColumnDef,
  type IDataGridDataSource,
} from '@alaarab/fluent-data-table';

interface IProduct {
  id: string;
  name: string;
  category: string;
  price: number;
}

const columns: IColumnDef<IProduct>[] = [ /* ... */ ];

const dataSource: IDataGridDataSource<IProduct> = {
  async getPage(params) {
    const response = await fetch(`/api/products?page=${params.page}&...`);
    return response.json(); // { items: IProduct[], totalCount: number }
  },
  async getFilterOptions(field) {
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
  const [multiSelectFilters, setMultiSelectFilters] = useState<Record<string, string[]>>({});
  const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.columnId)));

  // Load filter options via hook
  const { filterOptions, loadingOptions } = useFilterOptions(dataSource, ['category']);

  // Fetch data when params change
  useEffect(() => {
    dataSource.getPage({ page, pageSize, sortBy, sortDirection, filters: multiSelectFilters })
      .then(({ items, totalCount }) => {
        setItems(items);
        setTotalCount(totalCount);
      });
  }, [page, pageSize, sortBy, sortDirection, multiSelectFilters]);

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
          if (sortBy === col) {
            setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
          } else {
            setSortBy(col);
            setSortDirection('asc');
          }
        }}
        visibleColumns={visibleColumns}
        multiSelectFilters={multiSelectFilters}
        onMultiSelectFilterChange={(key, values) => {
          setMultiSelectFilters(prev => ({ ...prev, [key]: values }));
        }}
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

## Filtering patterns

- **Text filters**
  - Use `filterable: { type: 'text', filterField?: string }` on a column.
  - `filterField` is the key you send to your API; if omitted it defaults to `columnId`.
  - The grid calls `onTextFilterChange(filterField, value)` when the user applies the text filter.

- **Multi-select filters**
  - Use `filterable: { type: 'multiSelect', filterField?: string, optionsSource?: 'api' | 'static' | 'years', options?, yearsCount? }`.
  - Provide options via:
    - `optionsSource: 'static'` + `options: string[]`, or
    - `optionsSource: 'api'` + `getFilterOptions(field)` on your `IDataGridDataSource`, or
    - `optionsSource: 'years'` + `yearsCount` for a recent-years list.
  - The grid calls `onMultiSelectFilterChange(filterField, values)` with the selected values.

- **People filters**
  - Use `filterable: { type: 'people' }` for a people picker column.
  - Implement `peopleSearch(query)` and optionally `getUserByEmail(email)` on your `IDataGridDataSource`.
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

## API Reference

### Components

#### `DataGridTable<T>`

The main data grid component with sorting and filtering built into column headers.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `items` | `T[]` | Yes | Array of data items to display |
| `columns` | `IColumnDef<T>[]` | Yes | Column definitions |
| `getRowId` | `(item: T) => string` | Yes | Function to get unique row ID |
| `sortBy` | `string` | No | Currently sorted column ID |
| `sortDirection` | `'asc' \| 'desc'` | Yes | Sort direction |
| `onColumnSort` | `(columnKey: string) => void` | Yes | Called when user clicks sort |
| `visibleColumns` | `Set<string>` | No | Set of visible column IDs |
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
| `emptyState` | `{ onClearAll: () => void; hasActiveFilters: boolean }` | No | Empty state configuration |

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

Loads filter options for multi-select columns via `dataSource.getFilterOptions()`.

```tsx
const { filterOptions, loadingOptions } = useFilterOptions(dataSource, ['status', 'category']);
// filterOptions = { status: ['Active', 'Closed'], category: ['A', 'B'] }
// loadingOptions = { status: false, category: false }
```

### Types

#### `IDataGridDataSource<T>`

Data adapter interface. Implement this to connect the grid to your API.

```typescript
interface IDataGridDataSource<T> {
  /** Fetch a page of data with sorting and filtering. */
  getPage(params: IDataGridQueryParams): Promise<{ items: T[]; totalCount: number }>;

  /** Fetch distinct values for a filter field (for multi-select dropdowns). */
  getFilterOptions?(field: string): Promise<string[]>;

  /** Search for people (for people picker columns). */
  peopleSearch?(query: string): Promise<UserLike[]>;

  /** Lookup a user by email (for restoring people filters from URL). */
  getUserByEmail?(email: string): Promise<UserLike | undefined>;
}
```

#### `IDataGridQueryParams`

Parameters passed to `getPage()`.

```typescript
interface IDataGridQueryParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDirection: 'asc' | 'desc';
  filters: Record<string, string | string[]>;
}
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
import { buildCsvHeader, buildCsvRows, triggerCsvDownload, exportToCsv } from './DataTable';

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
├── dataGridTypes.ts              # IDataGridDataSource, IDataGridQueryParams, UserLike
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

## Storybook Setup (Future)

To add Storybook for isolated development:

```bash
# Install Storybook
npx storybook@latest init

# Create stories for each component
# src/components/DataTable/DataGridTable/DataGridTable.stories.tsx
# src/components/DataTable/ColumnChooser/ColumnChooser.stories.tsx
# etc.
```

Example story structure:

```tsx
// DataGridTable.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { DataGridTable } from './DataGridTable';

const meta: Meta<typeof DataGridTable> = {
  title: 'DataTable/DataGridTable',
  component: DataGridTable,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DataGridTable>;

export const Default: Story = {
  args: {
    items: mockData,
    columns: mockColumns,
    // ...
  },
};

export const WithFilters: Story = { /* ... */ };
export const Empty: Story = { /* ... */ };
export const Loading: Story = { /* ... */ };
```

## Extracting to Standalone Package

When ready to publish:

1. Run `npm run build` to compile TypeScript to `dist/esm` and emit types in `dist/types`.
2. Run `npm run test:unit` (or full `npm test` for component tests).
3. Run `npm run storybook` to validate behavior.
4. Publish with:

   ```bash
   npm publish --access public
   ```

### Consuming from ProjectCenter (local linking)

For local development with your `ProjectCenter` app:

1. From this repo, build and pack:

   ```bash
   npm run build
   npm pack
   ```

   This will create a tarball like `alaarab-fluent-data-table-1.0.0.tgz`.

2. In `ProjectCenter`, install the tarball:

   ```bash
   cd ../ProjectCenter
   npm install ../FluentDataTable/alaarab-fluent-data-table-1.0.0.tgz
   ```

3. Update imports in `ProjectCenter` table code from local paths to the package:

   ```ts
   import {
     DataGridTable,
     ColumnChooser,
     PaginationControls,
     useFilterOptions,
     type IColumnDef,
     type IDataGridDataSource,
   } from '@alaarab/fluent-data-table';
   ```

4. Run the existing Jest tests and SPFx build in `ProjectCenter` to verify everything still passes.

## Troubleshooting

- **Nothing renders / grid is blank**
  - Check you’re passing `items`, `columns`, and a working `getRowId`.
  - Ensure `visibleColumns` contains the `columnId`s you expect.

- **Filters don’t affect data**
  - Verify your `IDataGridDataSource.getPage` uses `params.filters` and `params.sortBy`/`sortDirection`.
  - Ensure your filter handlers (`onMultiSelectFilterChange`, `onTextFilterChange`, `onPeopleFilterChange`) actually update the state you pass back into the grid.

- **CSV export downloads an empty file**
  - Confirm you’re passing the same `columns`/`items` that the grid sees.
  - Check your `getValue(item, columnId)` implementation and whether some values are `null`/`undefined` (they become empty strings).

## Design Decisions

### Why Data Source Pattern?

The `IDataGridDataSource<T>` abstraction keeps the grid **agnostic of your API**:
- Grid doesn't know about REST, GraphQL, or local data
- Host maps grid params to API calls
- Easy to swap backends or add caching
- Testable with mock data sources

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

