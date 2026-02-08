import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DataGridTable } from './DataGridTable';
import type { IColumnDef } from '@alaarab/ogrid-core';

interface Row {
  id: string;
  name: string;
  status: string;
  owner: string;
}

const rows: Row[] = [
  { id: '1', name: 'Alpha', status: 'Active', owner: 'alice@test.com' },
  { id: '2', name: 'Beta', status: 'Closed', owner: 'bob@test.com' },
  { id: '3', name: 'Gamma', status: 'Active', owner: 'carol@test.com' },
  { id: '4', name: 'Delta', status: 'Planning', owner: 'dave@test.com' },
];

const columns: IColumnDef<Row>[] = [
  {
    columnId: 'name',
    name: 'Name',
    sortable: true,
    filterable: { type: 'text' },
    renderCell: (item) => <span>{item.name}</span>,
  },
  {
    columnId: 'status',
    name: 'Status',
    sortable: true,
    filterable: { type: 'multiSelect', filterField: 'status' },
    renderCell: (item) => <span>{item.status}</span>,
  },
  {
    columnId: 'owner',
    name: 'Owner',
    sortable: true,
    filterable: { type: 'people', filterField: 'ownerEmail' },
    renderCell: (item) => <span>{item.owner}</span>,
  },
];

const getRowId = (r: Row) => r.id;

const noop = () => {};

const meta: Meta<typeof DataGridTable<Row>> = {
  title: 'OGrid/Fluent/DataGridTable',
  component: DataGridTable as React.ComponentType,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof DataGridTable<Row>>;

export const Default: Story = {
  render: () => (
    <DataGridTable<Row>
      items={rows}
      columns={columns}
      getRowId={getRowId}
      sortBy="name"
      sortDirection="asc"
      onColumnSort={noop}
      visibleColumns={new Set(['name', 'status', 'owner'])}
      multiSelectFilters={{}}
      onMultiSelectFilterChange={noop}
      textFilters={{}}
      onTextFilterChange={noop}
      peopleFilters={{}}
      onPeopleFilterChange={noop}
      filterOptions={{ status: ['Active', 'Closed', 'Planning'] }}
      loadingFilterOptions={{}}
    />
  ),
};

export const Empty: Story = {
  render: () => (
    <DataGridTable<Row>
      items={[]}
      columns={columns}
      getRowId={getRowId}
      sortBy={undefined}
      sortDirection="asc"
      onColumnSort={noop}
      visibleColumns={new Set(['name', 'status', 'owner'])}
      multiSelectFilters={{}}
      onMultiSelectFilterChange={noop}
      textFilters={{}}
      onTextFilterChange={noop}
      peopleFilters={{}}
      onPeopleFilterChange={noop}
      filterOptions={{}}
      loadingFilterOptions={{}}
      emptyState={{
        hasActiveFilters: false,
        onClearAll: noop,
      }}
    />
  ),
};

export const EmptyWithActiveFilters: Story = {
  render: () => (
    <DataGridTable<Row>
      items={[]}
      columns={columns}
      getRowId={getRowId}
      sortBy={undefined}
      sortDirection="asc"
      onColumnSort={noop}
      visibleColumns={new Set(['name', 'status', 'owner'])}
      multiSelectFilters={{ status: ['Active'] }}
      onMultiSelectFilterChange={noop}
      textFilters={{}}
      onTextFilterChange={noop}
      peopleFilters={{}}
      onPeopleFilterChange={noop}
      filterOptions={{ status: ['Active', 'Closed', 'Planning'] }}
      loadingFilterOptions={{}}
      emptyState={{
        hasActiveFilters: true,
        onClearAll: noop,
      }}
    />
  ),
};

export const WithPeopleFilter: Story = {
  render: () => (
    <DataGridTable<Row>
      items={rows}
      columns={columns}
      getRowId={getRowId}
      sortBy="name"
      sortDirection="asc"
      onColumnSort={noop}
      visibleColumns={new Set(['name', 'status', 'owner'])}
      multiSelectFilters={{}}
      onMultiSelectFilterChange={noop}
      textFilters={{}}
      onTextFilterChange={noop}
      peopleFilters={{}}
      onPeopleFilterChange={noop}
      filterOptions={{ status: ['Active', 'Closed', 'Planning'] }}
      loadingFilterOptions={{}}
      peopleSearch={async (query) => [
        { displayName: 'Alice Johnson', email: 'alice@test.com' },
        { displayName: 'Bob Smith', email: 'bob@test.com' },
      ].filter((u) => u.displayName.toLowerCase().includes(query.toLowerCase()))}
    />
  ),
};
