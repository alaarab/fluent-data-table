import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataGridTable } from '../DataGridTable/DataGridTable';
import type { IColumnDef } from '@alaarab/ogrid-core';
import { fixtureRows, getRowId, type FixtureRow } from './fixtures';

const twoColumnColumns: IColumnDef<FixtureRow>[] = [
  {
    columnId: 'name',
    name: 'Name',
    sortable: true,
    filterable: { type: 'text' },
    renderCell: (item) => <span data-testid="cell-name">{item.name}</span>,
  },
  {
    columnId: 'status',
    name: 'Status',
    sortable: true,
    filterable: { type: 'multiSelect', filterField: 'status' },
    renderCell: (item) => <span data-testid="cell-status">{item.status}</span>,
  },
];

function renderTable(overrides: Partial<React.ComponentProps<typeof DataGridTable<FixtureRow>>> = {}) {
  const defaultProps: React.ComponentProps<typeof DataGridTable<FixtureRow>> = {
    items: fixtureRows.slice(0, 2),
    columns: twoColumnColumns,
    getRowId,
    sortBy: undefined,
    sortDirection: 'asc',
    onColumnSort: jest.fn(),
    visibleColumns: new Set(['name', 'status']),
    multiSelectFilters: {},
    onMultiSelectFilterChange: jest.fn(),
    textFilters: {},
    onTextFilterChange: jest.fn(),
    peopleFilters: {},
    onPeopleFilterChange: jest.fn(),
    filterOptions: { status: ['Active', 'Closed'] },
    loadingFilterOptions: {},
  };
  return render(<DataGridTable<FixtureRow> {...defaultProps} {...overrides} />);
}

describe('DataGridTable (Material)', () => {
  it('renders rows and cells for visible columns', () => {
    renderTable();
    expect(screen.getAllByTestId('cell-name').map((el) => el.textContent)).toEqual(['Alpha', 'Beta']);
    expect(screen.getAllByTestId('cell-status').map((el) => el.textContent)).toEqual(['Active', 'Closed']);
  });

  it('hides columns not in visibleColumns', () => {
    renderTable({ visibleColumns: new Set(['name']) });
    expect(screen.getAllByTestId('cell-name')).toHaveLength(2);
    expect(screen.queryByTestId('cell-status')).not.toBeInTheDocument();
  });

  it('sets aria-label when provided', () => {
    const { container } = renderTable({ 'aria-label': 'Projects grid' });
    const region = container.querySelector('[role="region"][aria-label="Projects grid"]');
    expect(region).toBeInTheDocument();
  });
});
