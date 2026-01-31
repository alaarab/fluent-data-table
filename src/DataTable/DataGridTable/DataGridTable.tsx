import * as React from 'react';
import { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import {
  DataGrid,
  DataGridHeader,
  DataGridRow,
  DataGridHeaderCell,
  DataGridBody,
  DataGridCell,
  TableColumnDefinition,
  createTableColumn,
  TableColumnSizingOptions,
} from '@fluentui/react-components';
import { ColumnHeaderFilter } from '../ColumnHeaderFilter';
import type { IColumnDef } from '../columnTypes';
import type { UserLike } from '../dataGridTypes';
import styles from './DataGridTable.module.scss';

export interface IDataGridTableProps<T> {
  items: T[];
  columns: IColumnDef<T>[];
  getRowId: (item: T) => string;
  sortBy?: string;
  sortDirection: 'asc' | 'desc';
  onColumnSort: (columnKey: string) => void;
  visibleColumns?: Set<string>;

  multiSelectFilters: Record<string, string[]>;
  onMultiSelectFilterChange: (key: string, values: string[]) => void;
  textFilters?: Record<string, string>;
  onTextFilterChange?: (key: string, value: string) => void;
  peopleFilters?: Record<string, UserLike | undefined>;
  onPeopleFilterChange?: (key: string, user: UserLike | undefined) => void;

  filterOptions: Record<string, string[]>;
  loadingFilterOptions: Record<string, boolean>;
  peopleSearch?: (query: string) => Promise<UserLike[]>;
  getUserByEmail?: (email: string) => Promise<UserLike | undefined>;

  emptyState?: { onClearAll: () => void; hasActiveFilters: boolean };
}

export function DataGridTable<T>(props: IDataGridTableProps<T>): React.ReactElement {
  const {
    items,
    columns,
    getRowId,
    sortBy,
    sortDirection,
    onColumnSort,
    visibleColumns,
    multiSelectFilters,
    onMultiSelectFilterChange,
    textFilters = {},
    onTextFilterChange,
    peopleFilters = {},
    onPeopleFilterChange,
    filterOptions,
    loadingFilterOptions,
    peopleSearch,
    getUserByEmail,
    emptyState,
  } = props;

  const wrapperRef = useRef<HTMLDivElement>(null);

  // NOTE: We intentionally do NOT recompute columnSizingOptions on container resize.
  // Fluent's resizing state is internal; re-creating sizing options on every resize
  // (or Storybook panel resize) effectively "pins" columns and makes drag-resize feel broken.

  const visibleColumnCount = (visibleColumns ? columns.filter((c) => visibleColumns.has(c.columnId)) : columns).length;

  // Fit vs overflow behavior ("professional grid" rule):
  // - Fill container by default, but never squash below per-column minWidth.
  // - If the container can't fit the sum of min widths (+ padding), allow overflow + horizontal scroll.
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const measure = () => {
      // getBoundingClientRect includes borders; subtract them so our "content width" is accurate.
      const rect = el.getBoundingClientRect();
      const cs = window.getComputedStyle(el);
      const borderX = (parseFloat(cs.borderLeftWidth || '0') || 0) + (parseFloat(cs.borderRightWidth || '0') || 0);
      setContainerWidth(Math.max(0, rect.width - borderX));
    };

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, []);

  const minTableWidth = useMemo(() => {
    const cols = visibleColumns ? columns.filter((c) => visibleColumns.has(c.columnId)) : columns;
    // Fluent's internal math includes per-column padding; default is 16.
    const PADDING = 16;
    return cols.reduce((sum, c) => sum + (c.minWidth ?? 80) + PADDING, 0);
  }, [columns, visibleColumns]);

  const allowOverflowX = containerWidth > 0 && minTableWidth > containerWidth;

  // Column sizing philosophy:
  // - Use sane defaults that don't make cells feel huge.
  // - Keep idealWidth aligned with defaultWidth unless explicitly provided.
  // - Let the user resize freely within minWidth constraints.
  const columnSizingOptions: TableColumnSizingOptions = useMemo(() => {
    const cols = visibleColumns ? columns.filter((c) => visibleColumns.has(c.columnId)) : columns;
    const acc: Record<string, { minWidth: number; defaultWidth?: number; idealWidth?: number }> = {};

    cols.forEach((c) => {
      const minW = c.minWidth ?? 80;
      const defaultW = c.defaultWidth ?? 120;

      acc[c.columnId] = {
        minWidth: minW,
        defaultWidth: Math.max(minW, defaultW),
        idealWidth: c.idealWidth ?? Math.max(minW, defaultW),
      };
    });

    return acc;
  }, [columns, visibleColumns]);

  const createHeaderWithFilter = useCallback(
    (col: IColumnDef<T>): React.ReactElement => {
      const filterable = col.filterable && typeof col.filterable === 'object' ? col.filterable : null;
      const filterType = filterable?.type ?? 'none';
      const filterField = filterable?.filterField ?? col.columnId;
      const sortable = col.sortable !== false;

      if (filterType === 'text') {
        return (
          <ColumnHeaderFilter
            columnKey={col.columnId}
            columnName={col.name}
            filterType="text"
            isSorted={sortBy === col.columnId}
            isSortedDescending={sortBy === col.columnId && sortDirection === 'desc'}
            onSort={sortable ? () => onColumnSort(col.columnId) : undefined}
            textValue={textFilters[filterField] ?? ''}
            onTextChange={onTextFilterChange ? (v) => onTextFilterChange(filterField, v) : undefined}
          />
        );
      }

      if (filterType === 'people') {
        return (
          <ColumnHeaderFilter
            columnKey={col.columnId}
            columnName={col.name}
            filterType="people"
            isSorted={sortBy === col.columnId}
            isSortedDescending={sortBy === col.columnId && sortDirection === 'desc'}
            onSort={sortable ? () => onColumnSort(col.columnId) : undefined}
            selectedUser={peopleFilters[filterField]}
            onUserChange={onPeopleFilterChange ? (u) => onPeopleFilterChange(filterField, u) : undefined}
            peopleSearch={peopleSearch}
            getUserByEmail={getUserByEmail}
          />
        );
      }

      if (filterType === 'multiSelect') {
        return (
          <ColumnHeaderFilter
            columnKey={col.columnId}
            columnName={col.name}
            filterType="multiSelect"
            isSorted={sortBy === col.columnId}
            isSortedDescending={sortBy === col.columnId && sortDirection === 'desc'}
            onSort={sortable ? () => onColumnSort(col.columnId) : undefined}
            options={filterOptions[filterField] ?? []}
            isLoadingOptions={loadingFilterOptions[filterField] ?? false}
            selectedValues={multiSelectFilters[filterField] ?? []}
            onFilterChange={(values) => onMultiSelectFilterChange(filterField, values)}
          />
        );
      }

      return (
        <ColumnHeaderFilter
          columnKey={col.columnId}
          columnName={col.name}
          filterType="none"
          isSorted={sortBy === col.columnId}
          isSortedDescending={sortBy === col.columnId && sortDirection === 'desc'}
          onSort={sortable ? () => onColumnSort(col.columnId) : undefined}
        />
      );
    },
    [
      sortBy,
      sortDirection,
      onColumnSort,
      textFilters,
      onTextFilterChange,
      peopleFilters,
      onPeopleFilterChange,
      peopleSearch,
      getUserByEmail,
      filterOptions,
      loadingFilterOptions,
      multiSelectFilters,
      onMultiSelectFilterChange,
    ]
  );

  const fluentColumns = useMemo<TableColumnDefinition<T>[]>(() => {
    const cols = visibleColumns ? columns.filter((c) => visibleColumns.has(c.columnId)) : columns;
    return cols.map((col) =>
      createTableColumn<T>({
        columnId: col.columnId,
        compare: col.compare ?? (() => 0),
        renderHeaderCell: () => createHeaderWithFilter(col),
        renderCell: (item) => (col.renderCell ? col.renderCell(item) : null),
      })
    );
  }, [columns, visibleColumns, createHeaderWithFilter]);

  const showEmptyInGrid = items.length === 0 && emptyState;

  return (
    <div
      ref={wrapperRef}
      className={styles.tableWrapper}
      data-empty={showEmptyInGrid ? 'true' : undefined}
      data-column-count={visibleColumnCount}
      data-overflow-x={allowOverflowX ? 'true' : 'false'}
      data-container-width={containerWidth}
      data-min-table-width={Math.round(minTableWidth)}
      style={{
        ['--data-table-column-count' as string]: visibleColumnCount,
        ['--data-table-min-width' as string]: allowOverflowX ? `${Math.round(minTableWidth)}px` : '100%',
      }}
    >
      <div className={styles.tableScrollContent}>
        <div className={styles.tableWidthAnchor}>
          <DataGrid
            items={items}
            columns={fluentColumns}
            resizableColumns
            // Small tables should fit the container; wide tables can overflow and scroll.
            resizableColumnsOptions={{ autoFitColumns: !allowOverflowX }}
            columnSizingOptions={columnSizingOptions}
            getRowId={getRowId}
            focusMode="composite"
            className={styles.dataGrid}
          >
            <DataGridHeader>
              <DataGridRow>
                {({ renderHeaderCell }) => <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>}
              </DataGridRow>
            </DataGridHeader>
            <DataGridBody<T>>
              {({ item, rowId }) => (
                <DataGridRow<T> key={rowId}>
                  {({ renderCell }) => <DataGridCell>{renderCell(item)}</DataGridCell>}
                </DataGridRow>
              )}
            </DataGridBody>
          </DataGrid>
        </div>
        {showEmptyInGrid && emptyState && (
          <div className={styles.emptyStateInGrid}>
            <div className={styles.emptyStateInGridMessageSticky}>
              <span className={styles.emptyStateInGridIcon} aria-hidden>
                📋
              </span>
              <div className={styles.emptyStateInGridTitle}>No results found</div>
              <div className={styles.emptyStateInGridMessage}>
                {emptyState.hasActiveFilters ? (
                  <>
                    No items match your current filters. Try adjusting your search or{' '}
                    <button type="button" className={styles.emptyStateInGridLink} onClick={emptyState.onClearAll}>
                      clear all filters
                    </button>{' '}
                    to see all items.
                  </>
                ) : (
                  'There are no items available at this time.'
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
