import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FluentDataTable } from '../FluentDataTable/FluentDataTable';
import { fixtureRows, fixtureColumns, getRowId, type FixtureRow } from './fixtures';

function renderFluentDataTable(overrides: Partial<React.ComponentProps<typeof FluentDataTable<FixtureRow>>> = {}) {
  const defaultProps: React.ComponentProps<typeof FluentDataTable<FixtureRow>> = {
    data: fixtureRows,
    columns: fixtureColumns,
    getRowId,
    entityLabelPlural: 'items',
    defaultPageSize: 10,
  };
  return render(<FluentDataTable<FixtureRow> {...defaultProps} {...overrides} />);
}

describe('FluentDataTable', () => {
  it('renders rows from items and respects visible columns', () => {
    renderFluentDataTable();
    expect(screen.getAllByTestId('cell-name').map((el) => el.textContent)).toEqual(['Alpha', 'Beta', 'Gamma']);
    expect(screen.getAllByTestId('cell-status').map((el) => el.textContent)).toEqual(['Active', 'Closed', 'Active']);
  });

  it('filtering reduces visible rows', () => {
    renderFluentDataTable({ defaultPageSize: 10 });
    const filterButton = screen.getByRole('button', { name: /filter status/i });
    fireEvent.click(filterButton);
    const closedCheckbox = screen.getByLabelText('Closed');
    fireEvent.click(closedCheckbox);
    fireEvent.click(screen.getByRole('button', { name: /apply/i }));
    expect(screen.getAllByTestId('cell-name').map((el) => el.textContent)).toEqual(['Beta']);
  });

  it('sort change updates order', () => {
    renderFluentDataTable();
    expect(screen.getAllByTestId('cell-name').map((el) => el.textContent)).toEqual(['Alpha', 'Beta', 'Gamma']);
    const sortButton = screen.getByRole('button', { name: /sort by name/i });
    fireEvent.click(sortButton);
    expect(screen.getAllByTestId('cell-name').map((el) => el.textContent)).toEqual(['Gamma', 'Beta', 'Alpha']);
    fireEvent.click(sortButton);
    expect(screen.getAllByTestId('cell-name').map((el) => el.textContent)).toEqual(['Alpha', 'Beta', 'Gamma']);
  });

  it('pagination shows correct slice', () => {
    renderFluentDataTable({ defaultPageSize: 2 });
    expect(screen.getAllByTestId('cell-name')).toHaveLength(2);
    expect(screen.getByText(/Showing 1 to 2 of 3 items/i)).toBeInTheDocument();
    const nextButton = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextButton);
    expect(screen.getAllByTestId('cell-name')).toHaveLength(1);
    expect(screen.getByText(/Showing 3 to 3 of 3 items/i)).toBeInTheDocument();
  });

  it('column visibility toggles columns', () => {
    renderFluentDataTable();
    expect(screen.getAllByTestId('cell-status')).toHaveLength(3);
    const columnVisibilityButton = screen.getByRole('button', { name: /column visibility/i });
    fireEvent.click(columnVisibilityButton);
    const statusCheckbox = screen.getByLabelText('Status');
    fireEvent.click(statusCheckbox);
    expect(screen.queryAllByTestId('cell-status')).toHaveLength(0);
    expect(screen.getAllByTestId('cell-name')).toHaveLength(3);
  });

  it('uses defaultSortBy and defaultSortDirection', () => {
    renderFluentDataTable({
      defaultSortBy: 'name',
      defaultSortDirection: 'desc',
    });
    expect(screen.getAllByTestId('cell-name').map((el) => el.textContent)).toEqual(['Gamma', 'Beta', 'Alpha']);
  });

  it('integration: filter reduces rows, sort changes order, page size changes row count, column hide hides column', () => {
    renderFluentDataTable({ defaultPageSize: 2 });

    expect(screen.getAllByTestId('cell-name')).toHaveLength(2);
    expect(screen.getAllByTestId('cell-status')).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: /filter status/i }));
    fireEvent.click(screen.getByLabelText('Active'));
    fireEvent.click(screen.getByRole('button', { name: /apply/i }));
    expect(screen.getAllByTestId('cell-name').map((el) => el.textContent)).toEqual(['Alpha', 'Gamma']);

    fireEvent.click(screen.getByRole('button', { name: /sort by name/i }));
    expect(screen.getAllByTestId('cell-name').map((el) => el.textContent)).toEqual(['Gamma', 'Alpha']);
    fireEvent.click(screen.getByRole('button', { name: /sort by name/i }));
    expect(screen.getAllByTestId('cell-name').map((el) => el.textContent)).toEqual(['Alpha', 'Gamma']);

    const rowsSelect = screen.getByLabelText('Rows per page');
    fireEvent.change(rowsSelect, { target: { value: '50' } });
    expect(screen.getAllByTestId('cell-name')).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: /column visibility/i }));
    fireEvent.click(screen.getByLabelText('Status'));
    expect(screen.queryByTestId('cell-status')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('cell-name')).toHaveLength(2);
  });
});
