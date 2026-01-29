# DataTable

A full-featured, generic data table component built on [Fluent UI DataGrid](https://react.fluentui.dev/?path=/docs/components-datagrid--default). Supports sorting, filtering (text, multi-select, people picker), pagination, column visibility, resizable columns, and CSV export.

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

Install from npm (package scope matches your GitHub/npm user):

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

### Using `<FluentDataTable />` (client-side data)

For client-side data (in-memory list), use the all-in-one **FluentDataTable** component. It manages sort, filters, column visibility, and pagination internally.

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
  const [items] = useState<IProduct[]>(/* ... */);

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

### Using DataGridTable + your own state (server-side / IDataGridDataSource)

For server-side data or when you use an `IDataGridDataSource<T>` adapter:

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

// 1. Define columns
const columns: IColumnDef<IProduct>[] = [
  {
    columnId: 'name',
    name: 'Product Name',
    sortable: true,
    filterable: { type: 'text' },
    renderCell: (item) => <span>{item.name}</span>,
  },
  {
    columnId: 'category',
    name: 'Category',
    sortable: true,
    filterable: { type: 'multiSelect', filterField: 'category' },
    renderCell: (item) => <span>{item.category}</span>,
  },
  {
    columnId: 'price',
    name: 'Price',
    sortable: true,
    filterable: false,
    renderCell: (item) => <span>${item.price.toFixed(2)}</span>,
  },
];

// 2. Implement data source
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

When ready to publish as a standalone package:

1. **Create new repo** with package scaffolding
2. **Copy component files** from `src/components/DataTable/`
3. **Update imports** to use package-relative paths
4. **Add peer dependencies** to `package.json`
5. **Configure build** (Rollup/Vite) to output ESM + CJS
6. **Add Storybook** for documentation
7. **Publish** to npm or private registry

### Recommended `package.json` for standalone:

```json
{
  "name": "@your-org/data-table",
  "version": "1.0.0",
  "main": "dist/cjs/index.js",
  "module": "dist/esm/index.js",
  "types": "dist/types/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js",
      "types": "./dist/types/index.d.ts"
    },
    "./styles": "./dist/styles.css"
  },
  "peerDependencies": {
    "@fluentui/react-components": "^9.0.0",
    "@fluentui/react-icons": "^2.0.0",
    "react": "^17.0.0 || ^18.0.0",
    "react-dom": "^17.0.0 || ^18.0.0"
  },
  "devDependencies": {
    "@storybook/react": "^8.0.0",
    "@storybook/react-vite": "^8.0.0",
    "vite": "^5.0.0",
    "typescript": "^5.0.0"
  }
}
```

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
