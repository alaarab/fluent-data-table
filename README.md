# OGrid

A lightweight, framework-agnostic data grid for React. Pick the UI framework you already use -- Fluent UI, Material UI, or bring your own -- and get sorting, filtering, pagination, column visibility, and CSV export out of the box. Designed to be the simpler, smaller, better-packaged alternative to AG Grid.

## Packages

| Package | npm | Description |
|---------|-----|-------------|
| [`@alaarab/ogrid-core`](./packages/core) | [![npm](https://img.shields.io/npm/v/@alaarab/ogrid-core)](https://www.npmjs.com/package/@alaarab/ogrid-core) | Framework-agnostic types, hooks, and utilities |
| [`@alaarab/ogrid-fluent`](./packages/fluent) | [![npm](https://img.shields.io/npm/v/@alaarab/ogrid-fluent)](https://www.npmjs.com/package/@alaarab/ogrid-fluent) | Fluent UI implementation |
| [`@alaarab/ogrid-material`](./packages/material) | [![npm](https://img.shields.io/npm/v/@alaarab/ogrid-material)](https://www.npmjs.com/package/@alaarab/ogrid-material) | Material UI implementation (MUI X DataGrid) |

## Features

- **Sorting** -- Click column headers to sort ascending/descending; configurable default sort
- **Filtering** -- Three filter types: text search, multi-select checkboxes, people picker
- **Pagination** -- Configurable page sizes with first/prev/next/last navigation
- **Column Visibility** -- Show/hide columns via a dropdown chooser
- **Empty State** -- Custom message or full custom content when no results
- **CSV Export** -- Export visible or all data to CSV
- **Generic Types** -- Works with any data type `<T>`
- **Data Source Pattern** -- Pass `data` (array) for client-side or `dataSource` for server-side
- **React 17 & 18** -- Compatible with both versions
- **Lightweight** -- No heavy runtime; just your framework's components + thin logic

## Quick Start

### Fluent UI

```bash
npm install @alaarab/ogrid-fluent
```

```tsx
import { OGrid, type IColumnDef } from '@alaarab/ogrid-fluent';

const columns: IColumnDef<Product>[] = [
  { columnId: 'name', name: 'Name', sortable: true, filterable: { type: 'text' }, renderCell: (item) => <span>{item.name}</span> },
  { columnId: 'category', name: 'Category', sortable: true, filterable: { type: 'multiSelect', filterField: 'category' }, renderCell: (item) => <span>{item.category}</span> },
  { columnId: 'price', name: 'Price', sortable: true, renderCell: (item) => <span>${item.price.toFixed(2)}</span> },
];

<OGrid<Product>
  data={products}
  columns={columns}
  getRowId={(r) => r.id}
  entityLabelPlural="products"
/>
```

### Material UI

```bash
npm install @alaarab/ogrid-material
```

```tsx
import { OGrid, type IColumnDef } from '@alaarab/ogrid-material';

<OGrid<Product>
  data={products}
  columns={columns}
  getRowId={(r) => r.id}
  entityLabelPlural="products"
/>
```

Both packages re-export everything from `@alaarab/ogrid-core`, so you only need one import.

### Server-Side Data

```tsx
import type { IDataSource } from '@alaarab/ogrid-core';

const dataSource: IDataSource<Product> = {
  async fetchPage(params) {
    const res = await fetch(`/api/products?page=${params.page}&pageSize=${params.pageSize}`);
    return res.json(); // { items: Product[], totalCount: number }
  },
  async fetchFilterOptions(field) {
    const res = await fetch(`/api/products/distinct/${field}`);
    return res.json(); // string[]
  },
};

// Works with either framework (same component name, different package):
<OGrid dataSource={dataSource} columns={columns} getRowId={(r) => r.id} />
```

## Architecture

```
ogrid/
├── packages/
│   ├── core/         # @alaarab/ogrid-core   – types, hooks, utilities
│   ├── fluent/       # @alaarab/ogrid-fluent  – Fluent UI components
│   ├── material/     # @alaarab/ogrid-material – Material UI components
│   └── examples/     # Example apps for each framework
├── turbo.json        # Turborepo task config
└── package.json      # Workspace root
```

- **Core** holds everything framework-agnostic: `IColumnDef`, `IDataSource`, `IFilters`, `useFilterOptions`, `exportToCsv`, etc.
- **Fluent** and **Material** each export **`<OGrid>`** (same component name) plus lower-level pieces (`DataGridTable`, `ColumnHeaderFilter`, `ColumnChooser`, `PaginationControls`) using their respective UI libraries.
- Both framework packages re-export core types and utilities for convenience -- consumers only need one import.

## API Overview

### Top-Level Component

Each framework package exports **`<OGrid>`** — same component name in both; the package you import from picks the implementation (Fluent or Material). It wires together the grid, filters, column chooser, and pagination.

| Prop | Type | Description |
|------|------|-------------|
| `columns` | `IColumnDef<T>[]` | Column definitions |
| `getRowId` | `(item: T) => string` | Unique row key |
| `data` | `T[]` | Client-side: in-memory array |
| `dataSource` | `IDataSource<T>` | Server-side: your API adapter |
| `defaultPageSize` | `number` | Initial rows per page (default 20) |
| `defaultSortBy` | `string` | Initial sort column |
| `defaultSortDirection` | `'asc' \| 'desc'` | Initial sort direction |
| `entityLabelPlural` | `string` | Label for pagination (e.g. "projects") |
| `title` | `ReactNode` | Optional title above the grid |
| `toolbar` | `ReactNode` | Optional toolbar (e.g. export button) |
| `emptyState` | `{ message?, render? }` | Custom empty state |
| `layoutMode` | `'content' \| 'fill'` | Grid sizing behavior |
| `aria-label` | `string` | Accessible name |

For controlled state, pass `page`, `sort`, `filters`, `visibleColumns` and the corresponding `on*Change` callbacks.

### Core Types

```typescript
interface IColumnDef<T> {
  columnId: string;
  name: string;
  sortable?: boolean;
  filterable?: false | { type: 'text' | 'multiSelect' | 'people'; filterField?: string };
  defaultVisible?: boolean;
  required?: boolean;
  minWidth?: number;
  defaultWidth?: number;
  idealWidth?: number;
  renderCell?: (item: T) => ReactNode;
  compare?: (a: T, b: T) => number;
}

interface IDataSource<T> {
  fetchPage(params: IFetchParams): Promise<{ items: T[]; totalCount: number }>;
  fetchFilterOptions?(field: string): Promise<string[]>;
  searchPeople?(query: string): Promise<UserLike[]>;
  getUserByEmail?(email: string): Promise<UserLike | undefined>;
}
```

See each package's README for the full API reference.

## Development

```bash
# Install all dependencies
npm install

# Run all tests (core + fluent + material)
npm run test:all

# Run tests for a specific package
npm run test:core
npm run test:fluent
npm run test:material

# Build all packages
npm run build

# Storybook
npm run storybook:fluent    # port 6006
npm run storybook:material  # port 6007

# Example apps
cd packages/examples
npm run dev:fluent           # port 3001
npm run dev:material         # port 3002
```

## Peer Dependencies

| Package | Peer Dependencies |
|---------|-------------------|
| `@alaarab/ogrid-core` | `react ^17 \|\| ^18` |
| `@alaarab/ogrid-fluent` | `react`, `react-dom`, `@fluentui/react-components ^9`, `@fluentui/react-icons ^2` |
| `@alaarab/ogrid-material` | `react`, `react-dom`, `@mui/material ^6`, `@mui/icons-material ^6`, `@mui/x-data-grid ^7`, `@emotion/react ^11`, `@emotion/styled ^11` |

## License

MIT
