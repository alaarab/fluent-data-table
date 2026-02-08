import * as React from 'react';
import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { DataGridTable } from '../DataGridTable/DataGridTable';
import type { IDataGridTableProps } from '../DataGridTable/DataGridTable';
import { ColumnChooser, type IColumnDefinition } from '../ColumnChooser/ColumnChooser';
import { PaginationControls } from '../PaginationControls/PaginationControls';
import {
  useFilterOptions,
  toDataGridFilterProps,
  type IColumnDef,
  type UserLike,
  type IFilters,
  type IDataSource,
} from '@alaarab/ogrid-core';

export interface IOGridProps<T> {
  columns: IColumnDef<T>[];
  getRowId: (item: T) => string;

  /** Client-side: pass an array; grid filters/sorts/pages in memory. */
  data?: T[];
  /** Server-side: pass a data source; grid calls fetchPage with params. */
  dataSource?: IDataSource<T>;

  /** Controlled: current page (1-based). Omit for uncontrolled. */
  page?: number;
  /** Controlled: page size. Omit for uncontrolled. */
  pageSize?: number;
  /** Controlled: sort. Omit for uncontrolled. */
  sort?: { field: string; direction: 'asc' | 'desc' };
  /** Controlled: unified filters. Omit for uncontrolled. */
  filters?: IFilters;
  /** Controlled: visible column ids. Omit for uncontrolled. */
  visibleColumns?: Set<string>;

  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSortChange?: (sort: { field: string; direction: 'asc' | 'desc' }) => void;
  onFiltersChange?: (filters: IFilters) => void;
  onVisibleColumnsChange?: (cols: Set<string>) => void;

  /** Initial page size when uncontrolled (default 20). */
  defaultPageSize?: number;
  /** Initial sort field when uncontrolled. */
  defaultSortBy?: string;
  /** Initial sort direction when uncontrolled (default 'asc'). */
  defaultSortDirection?: 'asc' | 'desc';

  toolbar?: React.ReactNode;
  emptyState?: { message?: React.ReactNode; render?: () => React.ReactNode };
  entityLabelPlural?: string;
  className?: string;
  title?: React.ReactNode;

  layoutMode?: 'content' | 'fill';

  'aria-label'?: string;
  'aria-labelledby'?: string;
}

const DEFAULT_PAGE_SIZE = 20;

function getFilterField<T>(col: IColumnDef<T>): string {
  const f = col.filterable && typeof col.filterable === 'object' ? col.filterable : null;
  return (f?.filterField ?? col.columnId) as string;
}

function getRowValue<T>(item: T, key: string): unknown {
  return (item as Record<string, unknown>)[key];
}

/** Merge a single filter change into a full IFilters object. */
function mergeFilter(
  prev: IFilters,
  key: string,
  value: string | string[] | UserLike | undefined
): IFilters {
  const next = { ...prev };
  const isEmpty =
    value === undefined ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'string' && value.trim() === '');
  const isPlainObjectWithoutEmail =
    typeof value === 'object' && value !== null && !Array.isArray(value) && !('email' in value);
  if (isEmpty || isPlainObjectWithoutEmail) {
    delete next[key];
  } else {
    next[key] = value;
  }
  return next;
}

/** Derive filter options for multiSelect columns from client-side data. */
function deriveFilterOptionsFromData<T>(items: T[], columns: IColumnDef<T>[]): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  columns.forEach((col) => {
    const f = col.filterable && typeof col.filterable === 'object' ? col.filterable : null;
    if (f?.type !== 'multiSelect') return;
    const field = getFilterField(col);
    const values = new Set<string>();
    items.forEach((item) => {
      const v = getRowValue(item, col.columnId);
      if (v != null && v !== '') values.add(String(v));
    });
    out[field] = Array.from(values).sort();
  });
  return out;
}

/** Get list of filter fields that use multiSelect (for useFilterOptions). */
function getMultiSelectFilterFields<T>(columns: IColumnDef<T>[]): string[] {
  const fields: string[] = [];
  columns.forEach((col) => {
    const f = col.filterable && typeof col.filterable === 'object' ? col.filterable : null;
    if (f?.type === 'multiSelect') fields.push(getFilterField(col));
  });
  return fields;
}

export function OGrid<T>(props: IOGridProps<T>): React.ReactElement {
  const {
    columns,
    getRowId,
    data,
    dataSource,
    page: controlledPage,
    pageSize: controlledPageSize,
    sort: controlledSort,
    filters: controlledFilters,
    visibleColumns: controlledVisibleColumns,
    onPageChange,
    onPageSizeChange,
    onSortChange,
    onFiltersChange,
    onVisibleColumnsChange,
    defaultPageSize = DEFAULT_PAGE_SIZE,
    defaultSortBy,
    defaultSortDirection = 'asc',
    toolbar,
    emptyState,
    entityLabelPlural = 'items',
    className,
    title,
    layoutMode = 'content',
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
  } = props;

  const isServerSide = dataSource != null;
  const isClientSide = data != null;
  if (!isServerSide && !isClientSide) {
    throw new Error('FluentDataTable requires either data (client-side) or dataSource (server-side).');
  }
  if (isServerSide && isClientSide) {
    throw new Error('FluentDataTable: pass either data or dataSource, not both.');
  }

  const defaultSortField = defaultSortBy ?? columns[0]?.columnId;

  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(defaultPageSize);
  const [internalSort, setInternalSort] = useState<{ field: string; direction: 'asc' | 'desc' }>({
    field: defaultSortField,
    direction: defaultSortDirection,
  });
  const [internalFilters, setInternalFilters] = useState<IFilters>({});
  const [internalVisibleColumns, setInternalVisibleColumns] = useState<Set<string>>(() => {
    const visible = columns.filter((c) => c.defaultVisible !== false).map((c) => c.columnId);
    return new Set(visible.length > 0 ? visible : columns.map((c) => c.columnId));
  });

  const page = controlledPage ?? internalPage;
  const pageSize = controlledPageSize ?? internalPageSize;
  const sort = controlledSort ?? internalSort;
  const filters = controlledFilters ?? internalFilters;
  const visibleColumns = controlledVisibleColumns ?? internalVisibleColumns;

  const setPage = useCallback(
    (p: number) => {
      if (controlledPage === undefined) setInternalPage(p);
      onPageChange?.(p);
    },
    [controlledPage, onPageChange]
  );
  const setPageSize = useCallback(
    (size: number) => {
      if (controlledPageSize === undefined) setInternalPageSize(size);
      onPageSizeChange?.(size);
      setPage(1);
    },
    [controlledPageSize, onPageSizeChange, setPage]
  );
  const setSort = useCallback(
    (s: { field: string; direction: 'asc' | 'desc' }) => {
      if (controlledSort === undefined) setInternalSort(s);
      onSortChange?.(s);
      setPage(1);
    },
    [controlledSort, onSortChange, setPage]
  );
  const setFilters = useCallback(
    (f: IFilters) => {
      if (controlledFilters === undefined) setInternalFilters(f);
      onFiltersChange?.(f);
      setPage(1);
    },
    [controlledFilters, onFiltersChange, setPage]
  );
  const setVisibleColumns = useCallback(
    (cols: Set<string>) => {
      if (controlledVisibleColumns === undefined) setInternalVisibleColumns(cols);
      onVisibleColumnsChange?.(cols);
    },
    [controlledVisibleColumns, onVisibleColumnsChange]
  );

  const { multiSelectFilters, textFilters, peopleFilters } = useMemo(
    () => toDataGridFilterProps(filters),
    [filters]
  );

  const handleSort = useCallback(
    (columnKey: string) => {
      setSort({
        field: columnKey,
        direction: sort.field === columnKey && sort.direction === 'asc' ? 'desc' : 'asc',
      });
    },
    [sort, setSort]
  );

  const handleMultiSelectFilterChange = useCallback(
    (key: string, values: string[]) => {
      setFilters(mergeFilter(filters, key, values.length ? values : undefined));
    },
    [filters, setFilters]
  );
  const handleTextFilterChange = useCallback(
    (key: string, value: string) => {
      setFilters(mergeFilter(filters, key, value.trim() || undefined));
    },
    [filters, setFilters]
  );
  const handlePeopleFilterChange = useCallback(
    (key: string, user: UserLike | undefined) => {
      setFilters(mergeFilter(filters, key, user ?? undefined));
    },
    [filters, setFilters]
  );

  const handleVisibilityChange = useCallback(
    (columnKey: string, isVisible: boolean) => {
      const next = new Set(visibleColumns);
      if (isVisible) next.add(columnKey);
      else next.delete(columnKey);
      setVisibleColumns(next);
    },
    [visibleColumns, setVisibleColumns]
  );

  const multiSelectFilterFields = useMemo(() => getMultiSelectFilterFields(columns), [columns]);

  const filterOptionsSource = useMemo(
    () => dataSource ?? { fetchFilterOptions: undefined },
    [dataSource]
  );

  const { filterOptions: serverFilterOptions, loadingOptions: loadingFilterOptions } = useFilterOptions(
    filterOptionsSource,
    multiSelectFilterFields
  );

  const clientFilterOptions = useMemo(() => {
    if (dataSource != null && dataSource.fetchFilterOptions) return serverFilterOptions;
    return deriveFilterOptionsFromData(data ?? [], columns);
  }, [dataSource, data, columns, serverFilterOptions]);

  const clientItemsAndTotal = useMemo(() => {
    if (!isClientSide || data == null) return null;
    let rows = (data as T[]).slice();
    columns.forEach((col) => {
      const filterKey = getFilterField(col);
      const f = col.filterable && typeof col.filterable === 'object' ? col.filterable : null;
      const type = f?.type;
      const val = filters[filterKey];
      if (type === 'multiSelect' && Array.isArray(val) && val.length > 0) {
        rows = rows.filter((r) => val.includes(String(getRowValue(r, col.columnId))));
      } else if (type === 'text' && typeof val === 'string' && val.trim()) {
        const lower = val.trim().toLowerCase();
        rows = rows.filter((r) => String(getRowValue(r, col.columnId) ?? '').toLowerCase().includes(lower));
      } else if (type === 'people' && val && typeof val === 'object' && 'email' in val) {
        const email = (val as UserLike).email.toLowerCase();
        rows = rows.filter((r) => String(getRowValue(r, col.columnId) ?? '').toLowerCase() === email);
      }
    });
    if (sort.field) {
      const col = columns.find((c) => c.columnId === sort.field);
      const compare = col?.compare;
      const dir = sort.direction === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        if (compare) return compare(a, b) * dir;
        const av = getRowValue(a, sort.field);
        const bv = getRowValue(b, sort.field);
        if (av == null && bv == null) return 0;
        if (av == null) return -1 * dir;
        if (bv == null) return 1 * dir;
        if (typeof av === 'number' && typeof bv === 'number') return av === bv ? 0 : av > bv ? dir : -dir;
        const as = String(av).toLowerCase();
        const bs = String(bv).toLowerCase();
        return as === bs ? 0 : as > bs ? dir : -dir;
      });
    }
    const total = rows.length;
    const start = (page - 1) * pageSize;
    const paged = rows.slice(start, start + pageSize);
    return { items: paged, totalCount: total };
  }, [isClientSide, data, columns, filters, sort.field, sort.direction, page, pageSize]);

  const [serverItems, setServerItems] = useState<T[]>([]);
  const [serverTotalCount, setServerTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const fetchIdRef = useRef(0);

  useEffect(() => {
    if (!isServerSide || !dataSource) {
      if (!isServerSide) setLoading(false);
      return;
    }
    const id = ++fetchIdRef.current;
    setLoading(true);
    dataSource
      .fetchPage({
        page,
        pageSize,
        sort: { field: sort.field, direction: sort.direction },
        filters,
      })
      .then((res) => {
        if (id !== fetchIdRef.current) return;
        setServerItems(res.items);
        setServerTotalCount(res.totalCount);
      })
      .catch((err) => {
        if (id !== fetchIdRef.current) return;
        console.error('FluentDataTable fetchPage error:', err);
        setServerItems([]);
        setServerTotalCount(0);
      })
      .finally(() => {
        if (id === fetchIdRef.current) setLoading(false);
      });
  }, [isServerSide, dataSource, page, pageSize, sort.field, sort.direction, filters]);

  const displayItems = isClientSide && clientItemsAndTotal ? clientItemsAndTotal.items : serverItems;
  const displayTotalCount = isClientSide && clientItemsAndTotal ? clientItemsAndTotal.totalCount : serverTotalCount;

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(
      (v) => v !== undefined && (Array.isArray(v) ? v.length > 0 : typeof v === 'string' ? v.trim() !== '' : true)
    );
  }, [filters]);

  const columnChooserColumns: IColumnDefinition[] = useMemo(
    () =>
      columns.map((c) => ({
        columnId: c.columnId,
        name: c.name,
        required: c.required === true,
      })),
    [columns]
  );

  const dataGridProps: IDataGridTableProps<T> = {
    items: displayItems,
    columns,
    getRowId,
    sortBy: sort.field,
    sortDirection: sort.direction,
    onColumnSort: handleSort,
    visibleColumns,
    isLoading: isServerSide && loading,
    multiSelectFilters,
    onMultiSelectFilterChange: handleMultiSelectFilterChange,
    textFilters,
    onTextFilterChange: handleTextFilterChange,
    peopleFilters,
    onPeopleFilterChange: handlePeopleFilterChange,
    filterOptions: clientFilterOptions,
    loadingFilterOptions: dataSource?.fetchFilterOptions ? loadingFilterOptions : {},
    peopleSearch: dataSource?.searchPeople,
    getUserByEmail: dataSource?.getUserByEmail,
    layoutMode,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    emptyState: {
      hasActiveFilters,
      onClearAll: () => setFilters({}),
      message: emptyState?.message,
      render: emptyState?.render,
    },
  };

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {title != null ? <div style={{ margin: 0 }}>{title}</div> : null}
        {toolbar}
        <ColumnChooser
          columns={columnChooserColumns}
          visibleColumns={visibleColumns}
          onVisibilityChange={handleVisibilityChange}
        />
      </div>

      <DataGridTable<T> {...dataGridProps} />

      <PaginationControls
        currentPage={page}
        pageSize={pageSize}
        totalCount={displayTotalCount}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        entityLabelPlural={entityLabelPlural}
      />
    </div>
  );
}

OGrid.displayName = 'OGrid';

/** @deprecated Use OGrid and IOGridProps. Kept for backward compatibility. */
export const FluentDataTable = OGrid;
/** @deprecated Use IOGridProps. Kept for backward compatibility. */
export type IFluentDataTableProps<T> = IOGridProps<T>;
