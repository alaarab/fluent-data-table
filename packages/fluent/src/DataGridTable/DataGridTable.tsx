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
  Spinner,
} from '@fluentui/react-components';
import { ColumnHeaderFilter } from '../ColumnHeaderFilter';
import type { IColumnDef, UserLike } from '@alaarab/ogrid-core';
import styles from './DataGridTable.module.scss';

export interface IDataGridTableProps<T> {
  items: T[];
  columns: IColumnDef<T>[];
  getRowId: (item: T) => string;
  sortBy?: string;
  sortDirection: 'asc' | 'desc';
  onColumnSort: (columnKey: string) => void;
  visibleColumns?: Set<string>;

  layoutMode?: 'content' | 'fill';

  isLoading?: boolean;
  loadingMessage?: string;

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

  emptyState?: {
    onClearAll: () => void;
    hasActiveFilters: boolean;
    message?: React.ReactNode;
    render?: () => React.ReactNode;
  };

  'aria-label'?: string;
  'aria-labelledby'?: string;
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
    isLoading = false,
    loadingMessage = 'Loading\u2026',
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
    layoutMode = 'content',
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
  } = props;

  const wrapperRef = useRef<HTMLDivElement>(null);

  const visibleColumnCount = (visibleColumns ? columns.filter((c) => visibleColumns.has(c.columnId)) : columns).length;

  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const measure = () => {
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
    const PADDING = 16;
    return cols.reduce((sum, c) => sum + (c.minWidth ?? 80) + PADDING, 0);
  }, [columns, visibleColumns]);

  const fitToContent = layoutMode === 'content';

  const [columnSizingOverrides, setColumnSizingOverrides] = useState<Record<string, { widthPx: number }>>({});

  const columnSizingOptions: TableColumnSizingOptions = useMemo(() => {
    const cols = visibleColumns ? columns.filter((c) => visibleColumns.has(c.columnId)) : columns;
    const acc: Record<string, { minWidth: number; defaultWidth?: number; idealWidth?: number }> = {};

    cols.forEach((c) => {
      const minW = c.minWidth ?? 80;
      const defaultW = c.defaultWidth ?? 120;
      const base = c.idealWidth ?? Math.max(minW, defaultW);

      const override = columnSizingOverrides[c.columnId];
      const w = override ? Math.max(minW, override.widthPx) : base;

      acc[c.columnId] = {
        minWidth: minW,
        defaultWidth: w,
        idealWidth: w,
      };
    });

    return acc;
  }, [columns, visibleColumns, columnSizingOverrides]);

  const desiredTableWidth = useMemo(() => {
    const cols = visibleColumns ? columns.filter((c) => visibleColumns.has(c.columnId)) : columns;
    const PADDING = 16;
    return cols.reduce((sum, c) => {
      const s = columnSizingOptions[c.columnId] as { idealWidth?: number; defaultWidth?: number; minWidth: number } | undefined;
      const w = s?.idealWidth ?? s?.defaultWidth ?? c.idealWidth ?? c.defaultWidth ?? c.minWidth ?? 80;
      return sum + Math.max(c.minWidth ?? 80, w) + PADDING;
    }, 0);
  }, [columns, visibleColumns, columnSizingOptions]);

  const allowOverflowX = containerWidth > 0 && (minTableWidth > containerWidth || desiredTableWidth > containerWidth);

  const totalColumnMinWidth = useMemo(() => {
    return Object.values(columnSizingOptions).reduce(
      (sum, opt) => sum + (typeof opt === 'object' && opt?.minWidth != null ? opt.minWidth : 0),
      0,
    );
  }, [columnSizingOptions]);

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
      sortBy, sortDirection, onColumnSort, textFilters, onTextFilterChange,
      peopleFilters, onPeopleFilterChange, peopleSearch, getUserByEmail,
      filterOptions, loadingFilterOptions, multiSelectFilters, onMultiSelectFilterChange,
    ]
  );

  const fluentColumns = useMemo<TableColumnDefinition<T>[]>(() => {
    const cols = visibleColumns ? columns.filter((c) => visibleColumns.has(c.columnId)) : columns;
    return cols.map((col) =>
      createTableColumn<T>({
        columnId: col.columnId,
        compare: col.compare ?? (() => 0),
        renderHeaderCell: () => <div data-column-id={col.columnId}>{createHeaderWithFilter(col)}</div>,
        renderCell: (item) => (col.renderCell ? col.renderCell(item) : null),
      })
    );
  }, [columns, visibleColumns, createHeaderWithFilter]);

  const showEmptyInGrid = items.length === 0 && emptyState;

  useEffect(() => {
    const root = wrapperRef.current;
    if (!root) return;

    const onDblClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (!target.closest('.fui-TableResizeHandle')) return;

      const headerCell = target.closest('[role="columnheader"]') as HTMLElement | null;
      if (!headerCell) return;

      const colId = headerCell.querySelector('[data-column-id]')?.getAttribute('data-column-id');
      if (!colId) return;

      const label = headerCell.querySelector('[data-header-label]') as HTMLElement | null;
      const labelWidth = label ? label.scrollWidth : 0;

      const EXTRA_PX = 44;
      const MAX_PX = 520;

      const colDef = columns.find((c) => c.columnId === colId);
      const minW = colDef?.minWidth ?? 80;

      const desired = Math.min(MAX_PX, Math.max(minW, Math.ceil(labelWidth + EXTRA_PX)));

      setColumnSizingOverrides((prev) => ({
        ...prev,
        [colId]: { widthPx: desired },
      }));

      e.preventDefault();
      e.stopPropagation();
    };

    root.addEventListener('dblclick', onDblClick, true);
    return () => root.removeEventListener('dblclick', onDblClick, true);
  }, [columns]);

  return (
    <div
      ref={wrapperRef}
      className={styles.tableWrapper}
      role="region"
      aria-label={ariaLabel ?? (ariaLabelledBy ? undefined : 'Data grid')}
      aria-labelledby={ariaLabelledBy}
      data-empty={showEmptyInGrid ? 'true' : undefined}
      data-column-count={visibleColumnCount}
      data-overflow-x={allowOverflowX ? 'true' : 'false'}
      data-container-width={containerWidth}
      data-min-table-width={Math.round(minTableWidth)}
      style={{
        ['--data-table-column-count' as string]: visibleColumnCount,
        ['--data-table-width' as string]: showEmptyInGrid
          ? '100%'
          : allowOverflowX
            ? 'fit-content'
            : fitToContent
              ? 'fit-content'
              : '100%',
        ['--data-table-min-width' as string]: showEmptyInGrid
          ? '100%'
          : allowOverflowX
            ? 'max-content'
            : fitToContent
              ? 'max-content'
              : '100%',
      }}
    >
      <div className={styles.tableScrollContent}>
        <div className={isLoading && items.length > 0 ? styles.loadingOverlayContainer : undefined}>
          {isLoading && items.length > 0 && (
            <div className={styles.loadingOverlay} aria-live="polite">
              <div className={styles.loadingOverlayContent}>
                <Spinner size="small" />
                <span className={styles.loadingOverlayText}>{loadingMessage}</span>
              </div>
            </div>
          )}
          <div className={isLoading && items.length > 0 ? styles.loadingDimmed : undefined}>
            <div className={styles.tableWidthAnchor}>
              <DataGrid
                items={items}
                columns={fluentColumns}
                resizableColumns
                resizableColumnsOptions={{ autoFitColumns: layoutMode === 'fill' && !allowOverflowX }}
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
          </div>
        </div>
        {showEmptyInGrid && emptyState && (
          <div className={styles.emptyStateInGrid}>
            <div className={styles.emptyStateInGridMessageSticky}>
              {emptyState.render ? (
                emptyState.render()
              ) : (
                <>
                  <span className={styles.emptyStateInGridIcon} aria-hidden>
                    📋
                  </span>
                  <div className={styles.emptyStateInGridTitle}>No results found</div>
                  <div className={styles.emptyStateInGridMessage}>
                    {emptyState.message != null ? (
                      emptyState.message
                    ) : emptyState.hasActiveFilters ? (
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
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
