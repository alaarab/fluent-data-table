# Changelog

All notable changes to this project will be documented in this file.

## [1.2.2] – 2025-02-05

- Version bump.

---

## [1.2.1] – 2025-02-05

### Changed

- **useFilterOptions** now accepts `IDataSource<T>` or any object with `fetchFilterOptions(field)` directly. No adapter or legacy `getFilterOptions`/`getPage` wrapper needed.
- **FluentDataTable** passes `dataSource` directly to `useFilterOptions` (removed internal filter-options adapter).

### Removed

- **IDataGridDataSource** and **IDataGridQueryParams** – removed; use **IDataSource** and **IFetchParams**.
- **toLegacyFilters(filters)** – removed; map `IFilters` to your API in your data source.

### Added

- **DataGridTable** supports **isLoading** and **loadingMessage** for an overlay during server-side refresh (AG Grid–style).

---

## [1.2.0]

- Single `IDataSource<T>` and unified **IFilters**; client-side (`data`) and server-side (`dataSource`).
- **IFetchParams**, **IPageResult**, **toDataGridFilterProps**, **toUserLike**.
- Optional controlled mode: `page`, `sort`, `filters`, `visibleColumns` and corresponding `on*` callbacks.
