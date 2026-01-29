import * as React from 'react';
import { useMemo, useCallback } from 'react';
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

  const columnSizingOptions: TableColumnSizingOptions = useMemo(() => {
    const acc: Record<string, { minWidth: number; defaultWidth: number; idealWidth: number }> = {};
    columns
      .filter((c) => c.minWidth !== undefined || c.defaultWidth !== undefined)
      .forEach((c) => {
        acc[c.columnId] = {
          minWidth: c.minWidth ?? 80,
          defaultWidth: c.defaultWidth ?? 120,
          idealWidth: c.idealWidth ?? c.defaultWidth ?? 120,
        };
      });
    return acc;
  }, [columns]);

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
    <div className={styles.tableWrapper} data-empty={showEmptyInGrid ? 'true' : undefined}>
      <div className={styles.tableScrollContent}>
        <DataGrid
          items={items}
          columns={fluentColumns}
          resizableColumns
          resizableColumnsOptions={{ autoFitColumns: false }}
          columnSizingOptions={columnSizingOptions}
          getRowId={getRowId}
          focusMode="composite"
          className={styles.dataGrid}
          style={{ minWidth: 'max-content' }}
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
