import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { OGrid } from '../MaterialDataTable/MaterialDataTable';
import { fixtureRows, fixtureColumns, getRowId, type FixtureRow } from './fixtures';

function renderOGrid(overrides: Partial<React.ComponentProps<typeof OGrid<FixtureRow>>> = {}) {
  const defaultProps: React.ComponentProps<typeof OGrid<FixtureRow>> = {
    data: fixtureRows,
    columns: fixtureColumns,
    getRowId,
    entityLabelPlural: 'items',
    defaultPageSize: 10,
  };
  return render(<OGrid<FixtureRow> {...defaultProps} {...overrides} />);
}

describe('OGrid (Material)', () => {
  it('renders rows from items', () => {
    renderOGrid();
    expect(screen.getAllByTestId('cell-name').map((el) => el.textContent)).toEqual(['Alpha', 'Beta', 'Gamma']);
    expect(screen.getAllByTestId('cell-status').map((el) => el.textContent)).toEqual(['Active', 'Closed', 'Active']);
  });

  it('uses defaultSortBy and defaultSortDirection', () => {
    renderOGrid({ defaultSortBy: 'name', defaultSortDirection: 'desc' });
    expect(screen.getAllByTestId('cell-name').map((el) => el.textContent)).toEqual(['Gamma', 'Beta', 'Alpha']);
  });
});
