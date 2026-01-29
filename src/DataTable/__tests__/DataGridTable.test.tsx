import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataGridTable } from '../DataGridTable/DataGridTable';
import type { IColumnDef } from '../columnTypes';

interface Row {
  id: string;
  name: string;
}

const columns: IColumnDef<Row>[] = [
  {
    columnId: 'name',
    name: 'Name',
    sortable: true,
    filterable: { type: 'text' },
    renderCell: (item) => <span data-testid="cell-name">{item.name}</span>,
  },
];

function renderTable(overrides: Partial<React.ComponentProps<typeof DataGridTable<Row>>> = {}) {
  const defaultProps: React.ComponentProps<typeof DataGridTable<Row>> = {
    items: [
      { id: '1', name: 'Alpha' },
      { id: '2', name: 'Beta' },
    ],
    columns,
    getRowId: (r) => r.id,
    sortBy: undefined,
    sortDirection: 'asc',
    onColumnSort: jest.fn(),
    visibleColumns: new Set(['name']),
    multiSelectFilters: {},
    onMultiSelectFilterChange: jest.fn(),
    textFilters: {},
    onTextFilterChange: jest.fn(),
    peopleFilters: {},
    onPeopleFilterChange: jest.fn(),
    filterOptions: {},
    loadingFilterOptions: {},
  };

  return render(<DataGridTable<Row> {...defaultProps} {...overrides} />);
}

describe('DataGridTable', () => {
  it('renders rows and cells for visible columns', () => {
    renderTable();

    expect(screen.getAllByTestId('cell-name').map((el) => el.textContent)).toEqual(['Alpha', 'Beta']);
  });

  it('calls onColumnSort when header clicked for sortable column', () => {
    const onColumnSort = jest.fn();
    renderTable({ onColumnSort });

    const headerButton = screen.getByRole('button', { name: /name/i });
    fireEvent.click(headerButton);

    expect(onColumnSort).toHaveBeenCalledWith('name');
  });

  it('shows empty state when no items and emptyState provided', () => {
    const onClearAll = jest.fn();
    renderTable({
      items: [],
      emptyState: { hasActiveFilters: true, onClearAll },
    });

    expect(screen.getByText(/No results found/i)).toBeInTheDocument();

    const clearButton = screen.getByRole('button', { name: /clear all filters/i });
    fireEvent.click(clearButton);
    expect(onClearAll).toHaveBeenCalled();
  });

  it('wires text filter through onTextFilterChange with filterField override', () => {
    const onTextFilterChange = jest.fn();

    const textFilterColumns: IColumnDef<Row>[] = [
      {
        columnId: 'name',
        name: 'Name',
        sortable: false,
        filterable: { type: 'text', filterField: 'nameFilter' },
        renderCell: (item) => <span data-testid="cell-name">{item.name}</span>,
      },
    ];

    renderTable({
      columns: textFilterColumns,
      onTextFilterChange,
    });

    const filterButton = screen.getByRole('button', { name: /filter name/i });
    fireEvent.click(filterButton);

    const input = screen.getByPlaceholderText(/enter search term/i);
    fireEvent.change(input, { target: { value: 'Alpha' } });

    const applyButton = screen.getByRole('button', { name: /apply/i });
    fireEvent.click(applyButton);

    expect(onTextFilterChange).toHaveBeenCalledWith('nameFilter', 'Alpha');
  });

  it('wires multi-select filter through onMultiSelectFilterChange with filterField', () => {
    const onMultiSelectFilterChange = jest.fn();

    const statusColumns: IColumnDef<Row>[] = [
      {
        columnId: 'name',
        name: 'Name',
        sortable: false,
        filterable: { type: 'multiSelect', filterField: 'status' },
        renderCell: (item) => <span data-testid="cell-name">{item.name}</span>,
      },
    ];

    renderTable({
      columns: statusColumns,
      onMultiSelectFilterChange,
      filterOptions: { status: ['Active', 'Closed'] },
    });

    const filterButton = screen.getByRole('button', { name: /filter name/i });
    fireEvent.click(filterButton);

    const selectAllButton = screen.getByRole('button', { name: /select all/i });
    fireEvent.click(selectAllButton);

    const applyButton = screen.getByRole('button', { name: /apply/i });
    fireEvent.click(applyButton);

    expect(onMultiSelectFilterChange).toHaveBeenCalledWith('status', ['Active', 'Closed']);
  });
});

