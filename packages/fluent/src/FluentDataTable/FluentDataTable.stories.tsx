import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { OGrid } from './FluentDataTable';
import type { IColumnDef } from '@alaarab/ogrid-core';

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

interface Project {
  id: string;
  name: string;
  status: string;
  owner: string;
  budget: number;
  startDate: string;
}

const STATUSES = ['Active', 'Planning', 'On Hold', 'Completed', 'Cancelled'];
const OWNERS = ['Alice Johnson', 'Bob Smith', 'Carol Lee', 'David Kim', 'Eve Torres'];

function makeProjects(count: number): Project[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `proj-${i + 1}`,
    name: `Project ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) || ''}`,
    status: STATUSES[i % STATUSES.length],
    owner: OWNERS[i % OWNERS.length],
    budget: Math.round((10000 + Math.random() * 90000) * 100) / 100,
    startDate: new Date(2024, i % 12, 1 + (i % 28)).toISOString().slice(0, 10),
  }));
}

const columns: IColumnDef<Project>[] = [
  {
    columnId: 'name',
    name: 'Project Name',
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
    filterable: { type: 'text' },
    renderCell: (item) => <span>{item.owner}</span>,
  },
  {
    columnId: 'budget',
    name: 'Budget',
    sortable: true,
    compare: (a, b) => a.budget - b.budget,
    renderCell: (item) => <span>${item.budget.toLocaleString()}</span>,
  },
  {
    columnId: 'startDate',
    name: 'Start Date',
    sortable: true,
    renderCell: (item) => <span>{item.startDate}</span>,
  },
];

const getRowId = (p: Project) => p.id;

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof OGrid<Project>> = {
  title: 'OGrid/Fluent/OGrid',
  component: OGrid as React.ComponentType,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof OGrid<Project>>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => (
    <OGrid<Project>
      data={makeProjects(50)}
      columns={columns}
      getRowId={getRowId}
      entityLabelPlural="projects"
      title={<h2 style={{ margin: 0 }}>Projects</h2>}
    />
  ),
};

export const SmallDataSet: Story = {
  render: () => (
    <OGrid<Project>
      data={makeProjects(5)}
      columns={columns}
      getRowId={getRowId}
      entityLabelPlural="projects"
      defaultPageSize={10}
    />
  ),
};

export const Empty: Story = {
  render: () => (
    <OGrid<Project>
      data={[]}
      columns={columns}
      getRowId={getRowId}
      entityLabelPlural="projects"
    />
  ),
};

export const DefaultSortDescending: Story = {
  render: () => (
    <OGrid<Project>
      data={makeProjects(30)}
      columns={columns}
      getRowId={getRowId}
      entityLabelPlural="projects"
      defaultSortBy="budget"
      defaultSortDirection="desc"
    />
  ),
};
