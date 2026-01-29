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

// --- Wide table: 10 and 20 columns ---
interface WideRow {
  id: string;
  project: string;
  owner: string;
  status: string;
  budget: number;
  region: string;
  startDate: string;
  endDate: string;
  priority: string;
  category: string;
  progress: number;
  costCenter: string;
  sponsor: string;
  risk: string;
  phase: string;
  milestone: string;
  vendor: string;
  contract: string;
  notes: string;
  tags: string;
}

const wideRows: WideRow[] = Array.from({ length: 15 }, (_, i) => {
  const statuses = ['Active', 'On Hold', 'Closed'];
  const regions = ['Americas', 'EMEA', 'APAC'];
  const priorities = ['High', 'Medium', 'Low'];
  const categories = ['Engineering', 'Marketing', 'Operations', 'Sales'];
  const risks = ['Low', 'Medium', 'High'];
  const phases = ['Discovery', 'Design', 'Build', 'Launch', 'Support'];
  return {
    id: String(i + 1),
    project: `Project ${String.fromCharCode(65 + (i % 26))}${i + 1}`,
    owner: `Owner ${i + 1}`,
    status: statuses[i % 3],
    budget: 50000 + i * 12000,
    region: regions[i % 3],
    startDate: `2024-0${(i % 9) + 1}-01`,
    endDate: `2025-0${(i % 9) + 1}-15`,
    priority: priorities[i % 3],
    category: categories[i % 4],
    progress: 10 + (i % 9) * 10,
    costCenter: `CC-${1000 + i}`,
    sponsor: `Sponsor ${i + 1}`,
    risk: risks[i % 3],
    phase: phases[i % 5],
    milestone: `M${i + 1}`,
    vendor: `Vendor ${(i % 5) + 1}`,
    contract: `CON-${2024 + (i % 2)}`,
    notes: `Notes for row ${i + 1}`,
    tags: `tag${i % 3 + 1}`,
  };
});

const wideColumns10: IColumnDef<WideRow>[] = [
  { columnId: 'project', name: 'Project', sortable: true, required: true, filterable: { type: 'text' }, renderCell: (r) => <span>{r.project}</span> },
  { columnId: 'owner', name: 'Owner', sortable: true, filterable: { type: 'text' }, renderCell: (r) => <span>{r.owner}</span> },
  { columnId: 'status', name: 'Status', sortable: true, filterable: { type: 'multiSelect', filterField: 'status' }, renderCell: (r) => <span>{r.status}</span> },
  { columnId: 'budget', name: 'Budget', sortable: true, renderCell: (r) => <span>${r.budget.toLocaleString()}</span> },
  { columnId: 'region', name: 'Region', sortable: true, filterable: { type: 'multiSelect', filterField: 'region' }, renderCell: (r) => <span>{r.region}</span> },
  { columnId: 'startDate', name: 'Start', sortable: true, renderCell: (r) => <span>{r.startDate}</span> },
  { columnId: 'endDate', name: 'End', sortable: true, renderCell: (r) => <span>{r.endDate}</span> },
  { columnId: 'priority', name: 'Priority', sortable: true, renderCell: (r) => <span>{r.priority}</span> },
  { columnId: 'category', name: 'Category', sortable: true, renderCell: (r) => <span>{r.category}</span> },
  { columnId: 'progress', name: 'Progress %', sortable: true, renderCell: (r) => <span>{r.progress}%</span> },
];

const wideColumns20: IColumnDef<WideRow>[] = [
  ...wideColumns10,
  { columnId: 'costCenter', name: 'Cost Center', sortable: true, renderCell: (r) => <span>{r.costCenter}</span> },
  { columnId: 'sponsor', name: 'Sponsor', sortable: true, renderCell: (r) => <span>{r.sponsor}</span> },
  { columnId: 'risk', name: 'Risk', sortable: true, renderCell: (r) => <span>{r.risk}</span> },
  { columnId: 'phase', name: 'Phase', sortable: true, renderCell: (r) => <span>{r.phase}</span> },
  { columnId: 'milestone', name: 'Milestone', sortable: true, renderCell: (r) => <span>{r.milestone}</span> },
  { columnId: 'vendor', name: 'Vendor', sortable: true, renderCell: (r) => <span>{r.vendor}</span> },
  { columnId: 'contract', name: 'Contract', sortable: true, renderCell: (r) => <span>{r.contract}</span> },
  { columnId: 'notes', name: 'Notes', sortable: true, renderCell: (r) => <span>{r.notes}</span> },
  { columnId: 'tags', name: 'Tags', sortable: true, renderCell: (r) => <span>{r.tags}</span> },
];

export const TenColumns: Story = {
  render: () => (
    <div style={{ padding: 16 }}>
      <FluentDataTable<WideRow>
        items={wideRows}
        columns={wideColumns10}
        getRowId={(r) => r.id}
        filterOptions={{ status: ['Active', 'On Hold', 'Closed'], region: ['Americas', 'EMEA', 'APAC'] }}
        entityLabelPlural="rows"
        defaultPageSize={10}
        title={<h3 style={{ margin: 0 }}>FluentDataTable — 10 columns</h3>}
      />
    </div>
  ),
};

export const TwentyColumns: Story = {
  render: () => (
    <div style={{ padding: 16 }}>
      <FluentDataTable<WideRow>
        items={wideRows}
        columns={wideColumns20}
        getRowId={(r) => r.id}
        filterOptions={{ status: ['Active', 'On Hold', 'Closed'], region: ['Americas', 'EMEA', 'APAC'] }}
        entityLabelPlural="rows"
        defaultPageSize={10}
        title={<h3 style={{ margin: 0 }}>FluentDataTable — 20 columns</h3>}
      />
    </div>
  ),
};
