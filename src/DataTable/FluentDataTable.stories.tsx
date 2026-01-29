import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';

import { FluentDataTable } from './FluentDataTable';
import type { IColumnDef } from './columnTypes';

interface DemoRow {
  id: string;
  project: string;
  owner: string;
  status: 'Active' | 'On Hold' | 'Closed';
  budget: number;
}

const allRows: DemoRow[] = [
  { id: '1', project: 'Apollo Migration', owner: 'Alice', status: 'Active', budget: 120000 },
  { id: '2', project: 'Billing Revamp', owner: 'Bob', status: 'On Hold', budget: 80000 },
  { id: '3', project: 'Customer 360', owner: 'Carla', status: 'Active', budget: 200000 },
  { id: '4', project: 'Data Lake Cleanup', owner: 'Derek', status: 'Closed', budget: 45000 },
  { id: '5', project: 'Eng Portal', owner: 'Evelyn', status: 'Active', budget: 150000 },
  { id: '6', project: 'Field App', owner: 'Frank', status: 'Closed', budget: 60000 },
  { id: '7', project: 'Growth Analytics', owner: 'Grace', status: 'On Hold', budget: 95000 },
  { id: '8', project: 'Help Center Refresh', owner: 'Hank', status: 'Active', budget: 40000 },
  { id: '9', project: 'Invoice Service', owner: 'Ivy', status: 'Active', budget: 110000 },
  { id: '10', project: 'Jupiter Rebrand', owner: 'Jamal', status: 'Closed', budget: 175000 },
  { id: '11', project: 'Knowledge Base AI', owner: 'Kate', status: 'Active', budget: 220000 },
  { id: '12', project: 'Lead Routing', owner: 'Leo', status: 'On Hold', budget: 70000 },
];

const columns: IColumnDef<DemoRow>[] = [
  {
    columnId: 'project',
    name: 'Project',
    sortable: true,
    required: true,
    filterable: { type: 'text' },
    renderCell: (item) => <span>{item.project}</span>,
  },
  {
    columnId: 'owner',
    name: 'Owner',
    sortable: true,
    filterable: { type: 'text' },
    renderCell: (item) => <span>{item.owner}</span>,
  },
  {
    columnId: 'status',
    name: 'Status',
    sortable: true,
    filterable: { type: 'multiSelect', filterField: 'status' },
    renderCell: (item) => <span>{item.status}</span>,
  },
  {
    columnId: 'budget',
    name: 'Budget',
    sortable: true,
    renderCell: (item) => <span>${item.budget.toLocaleString()}</span>,
  },
];

const meta: Meta = {
  title: 'DataTable/FluentDataTable',
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ padding: 16 }}>
      <FluentDataTable<DemoRow>
        items={allRows}
        columns={columns}
        getRowId={(r) => r.id}
        filterOptions={{ status: ['Active', 'On Hold', 'Closed'] }}
        entityLabelPlural="projects"
        defaultPageSize={5}
        title={<h3 style={{ margin: 0 }}>Projects</h3>}
      />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div style={{ padding: 16 }}>
      <FluentDataTable<DemoRow>
        items={[]}
        columns={columns}
        getRowId={(r) => r.id}
        filterOptions={{ status: ['Active', 'On Hold', 'Closed'] }}
        entityLabelPlural="projects"
        title={<h3 style={{ margin: 0 }}>Projects</h3>}
      />
    </div>
  ),
};

export const SmallDataSet: Story = {
  render: () => (
    <div style={{ padding: 16 }}>
      <FluentDataTable<DemoRow>
        items={allRows.slice(0, 3)}
        columns={columns}
        getRowId={(r) => r.id}
        filterOptions={{ status: ['Active', 'On Hold', 'Closed'] }}
        entityLabelPlural="projects"
        defaultPageSize={10}
        title={<h3 style={{ margin: 0 }}>Few projects</h3>}
      />
    </div>
  ),
};

export const LargePageSize: Story = {
  render: () => (
    <div style={{ padding: 16 }}>
      <FluentDataTable<DemoRow>
        items={allRows}
        columns={columns}
        getRowId={(r) => r.id}
        filterOptions={{ status: ['Active', 'On Hold', 'Closed'] }}
        entityLabelPlural="projects"
        defaultPageSize={50}
        title={<h3 style={{ margin: 0 }}>All on one page</h3>}
      />
    </div>
  ),
};
