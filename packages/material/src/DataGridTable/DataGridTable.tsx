import * as React from 'react';
import { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { ColumnHeaderFilter } from '../ColumnHeaderFilter';
import type { IColumnDef, UserLike } from '@alaarab/ogrid-core';

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
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      setContainerWidth(Math.max(0, rect.width));
    };

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, []);

  const visibleCols = useMemo(() => {
    return visibleColumns ? columns.filter((c) => visibleColumns.has(c.columnId)) : columns;
  }, [columns, visibleColumns]);

  const minTableWidth = useMemo(() => {
    return visibleCols.reduce((sum, c) => sum + (c.minWidth ?? 80), 0);
  }, [visibleCols]);

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
            onUserChange={
              onPeopleFilterChange ? (u) => onPeopleFilterChange(filterField, u) : undefined
            }
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
    ],
  );

  const muiColumns = useMemo<GridColDef[]>(() => {
    return visibleCols.map((col) => {
      const gridCol: GridColDef = {
        field: col.columnId,
        headerName: col.name,
        minWidth: col.minWidth ?? 80,
        width: col.idealWidth ?? col.defaultWidth ?? 120,
        flex: layoutMode === 'fill' ? 1 : undefined,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderHeader: () => createHeaderWithFilter(col),
        renderCell: col.renderCell
          ? (params: GridRenderCellParams) => col.renderCell!(params.row as T)
          : undefined,
      };
      return gridCol;
    });
  }, [visibleCols, createHeaderWithFilter, layoutMode]);

  const rows = useMemo(() => {
    return items.map((item) => ({
      ...item as Record<string, unknown>,
      id: getRowId(item),
    }));
  }, [items, getRowId]);

  const showEmptyState = items.length === 0 && emptyState;
  const allowOverflowX = containerWidth > 0 && minTableWidth > containerWidth;

  const NoRowsOverlay = useCallback(() => {
    if (!emptyState) return null;
    if (emptyState.render) {
      return <Box sx={{ py: 4 }}>{emptyState.render()}</Box>;
    }
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 6,
          px: 2,
        }}
      >
        <Typography variant="h2" sx={{ mb: 1 }} aria-hidden>
          📋
        </Typography>
        <Typography variant="h6" gutterBottom>
          No results found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          {emptyState.message != null ? (
            emptyState.message
          ) : emptyState.hasActiveFilters ? (
            <>
              No items match your current filters. Try adjusting your search or{' '}
              <Button
                variant="text"
                size="small"
                onClick={emptyState.onClearAll}
                sx={{ textTransform: 'none', p: 0, minWidth: 'auto', verticalAlign: 'baseline' }}
              >
                clear all filters
              </Button>{' '}
              to see all items.
            </>
          ) : (
            'There are no items available at this time.'
          )}
        </Typography>
      </Box>
    );
  }, [emptyState]);

  const LoadingOverlay = useCallback(
    () => (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 1,
        }}
      >
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary">
          {loadingMessage}
        </Typography>
      </Box>
    ),
    [loadingMessage],
  );

  return (
    <Box
      ref={wrapperRef}
      role="region"
      aria-label={ariaLabel ?? (ariaLabelledBy ? undefined : 'Data grid')}
      aria-labelledby={ariaLabelledBy}
      sx={{
        width: '100%',
        overflowX: allowOverflowX ? 'auto' : 'hidden',
      }}
    >
      <Box
        sx={{
          minWidth: allowOverflowX ? minTableWidth : undefined,
          '& .MuiDataGrid-root': {
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
          },
          '& .MuiDataGrid-columnHeader': {
            '&:focus, &:focus-within': {
              outline: 'none',
            },
          },
          '& .MuiDataGrid-cell': {
            '&:focus, &:focus-within': {
              outline: 'none',
            },
          },
        }}
      >
        <DataGrid
          rows={rows}
          columns={muiColumns}
          loading={isLoading}
          autoHeight={!showEmptyState || items.length > 0}
          disableColumnMenu
          disableColumnFilter
          disableColumnSorting
          disableRowSelectionOnClick
          hideFooter
          slots={{
            noRowsOverlay: NoRowsOverlay,
            loadingOverlay: LoadingOverlay,
          }}
          sx={{
            '& .MuiDataGrid-overlayWrapper': {
              minHeight: showEmptyState ? 200 : undefined,
            },
          }}
          getRowId={(row: Record<string, unknown>) => row.id as string}
          aria-label={ariaLabel}
        />
      </Box>
    </Box>
  );
}
