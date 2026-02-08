# @alaarab/ogrid-core

Framework-agnostic types, hooks, and utilities for [OGrid](https://github.com/alaarab/ogrid) data tables.

This package is the shared foundation used by `@alaarab/ogrid-fluent` and `@alaarab/ogrid-material`. You typically don't need to install it directly -- both framework packages re-export everything from core.

## Install

```bash
npm install @alaarab/ogrid-core
```

## What's Included

### Types

- `IColumnDef<T>` -- Column definition with sorting, filtering, and rendering
- `IDataSource<T>` -- Server-side data source interface
- `IFetchParams` -- Parameters for `fetchPage()`
- `IFilters` -- Unified filter values (text, multi-select, people)
- `UserLike` -- Minimal user shape for people picker
- `IColumnFilterDef`, `IColumnMeta`, `IPageResult`, `ColumnFilterType`

### Hooks

- `useFilterOptions(dataSource, fields)` -- Loads filter options for multi-select columns

### Utilities

- `toDataGridFilterProps(filters)` -- Splits `IFilters` into `multiSelectFilters`, `textFilters`, `peopleFilters`
- `toUserLike(user)` -- Converts a user-like object to `UserLike`
- `exportToCsv(items, columns, getValue, filename)` -- Full CSV export
- `buildCsvHeader`, `buildCsvRows`, `triggerCsvDownload`, `escapeCsvValue` -- Low-level CSV helpers

## License

MIT
