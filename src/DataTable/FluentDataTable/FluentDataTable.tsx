import * as React from 'react';
import { useMemo, useCallback, useState } from 'react';
import { DataGridTable } from '../DataGridTable/DataGridTable';
import type { IDataGridTableProps } from '../DataGridTable/DataGridTable';
import { ColumnChooser, type IColumnDefinition } from '../ColumnChooser/ColumnChooser';
import { PaginationControls } from '../PaginationControls/PaginationControls';
import type { IColumnDef } from '../columnTypes';
import type { UserLike } from '../dataGridTypes';

export interface IFluentDataTableProps<T> {
  items: T[];
  columns: IColumnDef<T>[];
  getRowId: (item: T) => string;
  filterOptions: Record<string, string[]>;
  loadingFilterOptions?: Record<string, boolean>;
  peopleSearch?: (query: string) => Promise<UserLike[]>;
  getUserByEmail?: (email: string) => Promise<UserLike | undefined>;
  entityLabelPlural?: string;
  defaultPageSize?: number;
  title?: React.ReactNode;
  className?: string;
}

const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function getFilterField<T>(col: IColumnDef<T>): string {
  const f = col.filterable && typeof col.filterable === 'object' ? col.filterable : null;
  return (f?.filterField ?? col.columnId) as string;
}

function getRowValue<T>(item: T, key: string): unknown {
  return (item as Record<string, unknown>)[key];
}

/**
 * FluentDataTable – full table with column chooser, filters, and pagination.
 * Use for client-side data: pass items and columns; sort/filter/page are managed internally.
 * For server-side data, use DataGridTable + ColumnChooser + PaginationControls with your own state.
 */
export function FluentDataTable<T>(props: IFluentDataTableProps<T>): React.ReactElement {
  const {
    items,
    columns,
    getRowId,
    filterOptions,
    loadingFilterOptions = {},
    peopleSearch,
    getUserByEmail,
    entityLabelPlural = 'items',
    defaultPageSize = DEFAULT_PAGE_SIZE,
    title,
    className,
  } = props;

  const [sortBy, setSortBy] = useState<string | undefined>(() => columns[0]?.columnId);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const visible = columns
      .filter((c) => c.defaultVisible !== false)
      .map((c) => c.columnId);
    return new Set(visible.length > 0 ? visible : columns.map((c) => c.columnId));
  });
  const [multiSelectFilters, setMultiSelectFilters] = useState<Record<string, string[]>>({});
  const [textFilters, setTextFilters] = useState<Record<string, string>>({});
  const [peopleFilters, setPeopleFilters] = useState<Record<string, UserLike | undefined>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const handleSort = useCallback((columnKey: string) => {
    setSortBy((prev) => (prev === columnKey ? prev : columnKey));
    setSortDirection((prev) => (sortBy === columnKey ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'));
  }, [sortBy]);

  const handleMultiSelectFilterChange = useCallback((key: string, values: string[]) => {
    setMultiSelectFilters((prev) => ({ ...prev, [key]: values }));
    setPage(1);
  }, []);

  const handleTextFilterChange = useCallback((key: string, value: string) => {
    setTextFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const handlePeopleFilterChange = useCallback((key: string, user: UserLike | undefined) => {
    setPeopleFilters((prev) => ({ ...prev, [key]: user }));
    setPage(1);
  }, []);

  const handleVisibilityChange = useCallback((columnKey: string, isVisible: boolean) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (isVisible) next.add(columnKey);
      else next.delete(columnKey);
      return next;
    });
  }, []);

  const filteredAndSorted = useMemo(() => {
    let rows = items.slice();

    columns.forEach((col) => {
      const filterKey = getFilterField(col);
      const f = col.filterable && typeof col.filterable === 'object' ? col.filterable : null;
      const type = f?.type;

      if (type === 'multiSelect') {
        const selected = multiSelectFilters[filterKey];
        if (selected && selected.length > 0) {
          rows = rows.filter((r) => {
            const val = getRowValue(r, col.columnId);
            return selected.includes(String(val));
          });
        }
      } else if (type === 'text') {
        const text = textFilters[filterKey]?.trim().toLowerCase();
        if (text) {
          rows = rows.filter((r) => {
            const val = getRowValue(r, col.columnId);
            return String(val ?? '').toLowerCase().includes(text);
          });
        }
      } else if (type === 'people') {
        const user = peopleFilters[filterKey];
        if (user?.email) {
          const email = user.email.toLowerCase();
          rows = rows.filter((r) => {
            const val = getRowValue(r, col.columnId);
            return String(val ?? '').toLowerCase() === email;
          });
        }
      }
    });

    if (sortBy) {
      const col = columns.find((c) => c.columnId === sortBy);
      const compare = col?.compare;
      const dir = sortDirection === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        if (compare) return compare(a, b) * dir;
        const av = getRowValue(a, sortBy);
        const bv = getRowValue(b, sortBy);
        if (av == null && bv == null) return 0;
        if (av == null) return -1 * dir;
        if (bv == null) return 1 * dir;
        if (typeof av === 'number' && typeof bv === 'number') {
          return av === bv ? 0 : av > bv ? dir : -dir;
        }
        const as = String(av).toLowerCase();
        const bs = String(bv).toLowerCase();
        if (as === bs) return 0;
        return as > bs ? dir : -dir;
      });
    }

    return rows;
  }, [items, columns, multiSelectFilters, textFilters, peopleFilters, sortBy, sortDirection]);

  const totalCount = filteredAndSorted.length;
  const start = (page - 1) * pageSize;
  const pagedItems = filteredAndSorted.slice(start, start + pageSize);

  const hasActiveFilters = useMemo(() => {
    if (Object.values(multiSelectFilters).some((arr) => arr && arr.length > 0)) return true;
    if (Object.values(textFilters).some((v) => v?.trim())) return true;
    if (Object.values(peopleFilters).some((u) => u != null)) return true;
    return false;
  }, [multiSelectFilters, textFilters, peopleFilters]);

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
    items: pagedItems,
    columns,
    getRowId,
    sortBy,
    sortDirection,
    onColumnSort: handleSort,
    visibleColumns,
    multiSelectFilters,
    onMultiSelectFilterChange: handleMultiSelectFilterChange,
    textFilters,
    onTextFilterChange: handleTextFilterChange,
    peopleFilters,
    onPeopleFilterChange: handlePeopleFilterChange,
    filterOptions,
    loadingFilterOptions,
    peopleSearch,
    getUserByEmail,
    emptyState: {
      hasActiveFilters,
      onClearAll: () => {
        setTextFilters({});
        setMultiSelectFilters({});
        setPeopleFilters({});
        setPage(1);
      },
    },
  };

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {title != null ? <div style={{ margin: 0 }}>{title}</div> : null}
        <ColumnChooser
          columns={columnChooserColumns}
          visibleColumns={visibleColumns}
          onVisibilityChange={handleVisibilityChange}
        />
      </div>

      <div style={{ border: '1px solid #e1dfdd', borderRadius: 8, overflow: 'hidden' }}>
        <DataGridTable<T> {...dataGridProps} />
      </div>

      <PaginationControls
        currentPage={page}
        pageSize={pageSize}
        totalCount={totalCount}
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
