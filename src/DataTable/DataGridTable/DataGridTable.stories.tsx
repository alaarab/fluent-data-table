import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { DataGridTable } from './DataGridTable';
import type { IColumnDef } from '../columnTypes';
import type { IDataGridTableProps } from './DataGridTable';
import type { UserLike } from '../dataGridTypes';

interface DemoRow {
  id: string;
  name: string;
  status: string;
}

const demoColumns: IColumnDef<DemoRow>[] = [
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
];

const meta: Meta<typeof DataGridTable<DemoRow>> = {
  title: 'DataTable/DataGridTable',
  component: DataGridTable as React.ComponentType<IDataGridTableProps<DemoRow>>,
};

export default meta;
type Story = StoryObj<typeof meta>;

const demoItems: DemoRow[] = [
  { id: '1', name: 'Alpha', status: 'Active' },
  { id: '2', name: 'Beta', status: 'Closed' },
  { id: '3', name: 'Gamma', status: 'Active' },
];

export const Default: Story = {
  render: () => {
    const [sortBy, setSortBy] = React.useState<string | undefined>();
    const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
    const [multiSelectFilters, setMultiSelectFilters] = React.useState<Record<string, string[]>>({});
    const [visibleColumns, setVisibleColumns] = React.useState<Set<string>>(
      () => new Set(demoColumns.map((c) => c.columnId)),
    );

    const handleSort = (columnKey: string) => {
      setSortBy((prev) => (prev === columnKey ? prev : columnKey));
      setSortDirection((prev) => (sortBy === columnKey && prev === 'asc' ? 'desc' : 'asc'));
    };

    const filterOptions = {
      status: ['Active', 'Closed'],
    };

    return (
      <DataGridTable<DemoRow>
        items={demoItems}
        columns={demoColumns}
        getRowId={(r) => r.id}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onColumnSort={handleSort}
        visibleColumns={visibleColumns}
        multiSelectFilters={multiSelectFilters}
        onMultiSelectFilterChange={(key, values) =>
          setMultiSelectFilters((prev) => ({ ...prev, [key]: values }))
        }
        filterOptions={filterOptions}
        loadingFilterOptions={{}}
      />
    );
  },
};

export const Empty: Story = {
  render: () => (
    <DataGridTable<DemoRow>
      items={[]}
      columns={demoColumns}
      getRowId={(r) => r.id}
      sortBy={undefined}
      sortDirection="asc"
      onColumnSort={() => undefined}
      visibleColumns={new Set(demoColumns.map((c) => c.columnId))}
      multiSelectFilters={{}}
      onMultiSelectFilterChange={() => undefined}
      filterOptions={{}}
      loadingFilterOptions={{}}
      emptyState={{
        hasActiveFilters: false,
        onClearAll: () => undefined,
      }}
    />
  ),
};

export const EmptyWithActiveFilters: Story = {
  render: () => {
    const [multiSelectFilters, setMultiSelectFilters] = React.useState<Record<string, string[]>>({
      status: ['Closed'],
    });
    return (
      <div style={{ padding: 16 }}>
        <p style={{ marginBottom: 8 }}>
          Empty grid with filters applied – shows &quot;No results found&quot; and a clear-all link.
        </p>
        <DataGridTable<DemoRow>
          items={[]}
          columns={demoColumns}
          getRowId={(r) => r.id}
          sortBy={undefined}
          sortDirection="asc"
          onColumnSort={() => undefined}
          visibleColumns={new Set(demoColumns.map((c) => c.columnId))}
          multiSelectFilters={multiSelectFilters}
          onMultiSelectFilterChange={(key, values) => setMultiSelectFilters((prev) => ({ ...prev, [key]: values }))}
          filterOptions={{ status: ['Active', 'Closed'] }}
          loadingFilterOptions={{}}
          emptyState={{
            hasActiveFilters: true,
            onClearAll: () => setMultiSelectFilters({ status: [] }),
          }}
        />
      </div>
    );
  },
};

interface PeopleRow {
  id: string;
  project: string;
  ownerName: string;
  ownerEmail: string;
}

const peopleRows: PeopleRow[] = [
  { id: '1', project: 'Apollo Migration', ownerName: 'Alice Johnson', ownerEmail: 'alice@example.com' },
  { id: '2', project: 'Billing Revamp', ownerName: 'Bob Smith', ownerEmail: 'bob@example.com' },
  { id: '3', project: 'Customer 360', ownerName: 'Alice Johnson', ownerEmail: 'alice@example.com' },
];

const peopleColumns: IColumnDef<PeopleRow>[] = [
  {
    columnId: 'project',
    name: 'Project',
    sortable: true,
    filterable: { type: 'text', filterField: 'project' },
    renderCell: (item) => <span>{item.project}</span>,
  },
  {
    columnId: 'owner',
    name: 'Owner',
    sortable: false,
    filterable: { type: 'people', filterField: 'ownerEmail' },
    renderCell: (item) => (
      <span>
        {item.ownerName} ({item.ownerEmail})
      </span>
    ),
  },
];

export const WithPeopleFilter: Story = {
  render: () => {
    const [sortBy, setSortBy] = React.useState<string | undefined>('project');
    const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
    const [peopleFilters, setPeopleFilters] = React.useState<Record<string, UserLike | undefined>>({});

    const ownerFilter = peopleFilters.ownerEmail;

    const filteredItems = React.useMemo(() => {
      if (!ownerFilter) return peopleRows;
      const email = ownerFilter.email.toLowerCase();
      return peopleRows.filter((row) => row.ownerEmail.toLowerCase() === email);
    }, [ownerFilter]);

    const peopleDirectory: UserLike[] = React.useMemo(
      () => [
        { id: '1', displayName: 'Alice Johnson', email: 'alice@example.com' },
        { id: '2', displayName: 'Bob Smith', email: 'bob@example.com' },
        { id: '3', displayName: 'Charlie Nguyen', email: 'charlie@example.com' },
      ],
      [],
    );

    const peopleSearch = async (query: string): Promise<UserLike[]> => {
      const q = query.toLowerCase().trim();
      if (!q) return [];
      return peopleDirectory.filter(
        (u) => u.displayName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      );
    };

    const getUserByEmail = async (email: string): Promise<UserLike | undefined> => {
      const q = email.toLowerCase();
      return peopleDirectory.find((u) => u.email.toLowerCase() === q);
    };

    const handleSort = (columnKey: string) => {
      setSortBy((prev) => (prev === columnKey ? prev : columnKey));
      setSortDirection((prev) => (sortBy === columnKey && prev === 'asc' ? 'desc' : 'asc'));
    };

    return (
      <div style={{ padding: 16 }}>
        <p style={{ marginBottom: 8 }}>
          Demonstrates a <strong>people picker header filter</strong> wired to a fake directory. Selecting a
          person filters rows by <code>ownerEmail</code>.
        </p>
        <DataGridTable<PeopleRow>
          items={filteredItems}
          columns={peopleColumns}
          getRowId={(r) => r.id}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onColumnSort={handleSort}
          visibleColumns={new Set(peopleColumns.map((c) => c.columnId))}
          multiSelectFilters={{}}
          onMultiSelectFilterChange={() => undefined}
          textFilters={{}}
          onTextFilterChange={() => undefined}
          peopleFilters={peopleFilters}
          onPeopleFilterChange={(key, user) =>
            setPeopleFilters((prev) => ({
              ...prev,
              [key]: user,
            }))
          }
          filterOptions={{}}
          loadingFilterOptions={{}}
          peopleSearch={peopleSearch}
          getUserByEmail={getUserByEmail}
        />
      </div>
    );
  },
};

