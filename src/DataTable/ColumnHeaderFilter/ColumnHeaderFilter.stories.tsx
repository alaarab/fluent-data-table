import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { ColumnHeaderFilter } from './ColumnHeaderFilter';
import type { UserLike } from '../dataGridTypes';

const meta: Meta<typeof ColumnHeaderFilter> = {
  title: 'DataTable/ColumnHeaderFilter',
  component: ColumnHeaderFilter,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Column header with sort indicator and optional filter popover (text, multi-select, or people). Used by DataGridTable.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const NoFilter: Story = {
  args: {
    columnKey: 'id',
    columnName: 'ID',
    filterType: 'none',
    onSort: () => undefined,
  },
  render: (args) => (
    <div style={{ padding: 16, border: '1px solid #ccc', minWidth: 120 }}>
      <ColumnHeaderFilter {...args} />
    </div>
  ),
};

export const TextFilter: Story = {
  args: {
    columnKey: 'name',
    columnName: 'Name',
    filterType: 'text',
    textValue: '',
    onTextChange: () => undefined,
    onSort: () => undefined,
  },
  render: (args) => (
    <div style={{ padding: 16, border: '1px solid #ccc', minWidth: 160 }}>
      <ColumnHeaderFilter {...args} />
    </div>
  ),
};

export const MultiSelectFilter: Story = {
  args: {
    columnKey: 'status',
    columnName: 'Status',
    filterType: 'multiSelect',
    selectedValues: [],
    onFilterChange: () => undefined,
    options: ['Active', 'On Hold', 'Closed'],
    onSort: () => undefined,
  },
  render: (args) => (
    <div style={{ padding: 16, border: '1px solid #ccc', minWidth: 140 }}>
      <ColumnHeaderFilter {...args} />
    </div>
  ),
};

const peopleDirectory: UserLike[] = [
  { id: '1', displayName: 'Alice Johnson', email: 'alice@example.com' },
  { id: '2', displayName: 'Bob Smith', email: 'bob@example.com' },
];

export const PeopleFilter: Story = {
  args: {
    columnKey: 'owner',
    columnName: 'Owner',
    filterType: 'people',
    selectedUser: undefined,
    onUserChange: () => undefined,
    peopleSearch: async (query: string) => {
      const q = query.toLowerCase();
      return peopleDirectory.filter(
        (u) => u.displayName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    },
  },
  render: (args) => (
    <div style={{ padding: 16, border: '1px solid #ccc', minWidth: 140 }}>
      <ColumnHeaderFilter {...args} />
    </div>
  ),
};

export const SortedAscending: Story = {
  args: {
    columnKey: 'name',
    columnName: 'Name',
    filterType: 'none',
    isSorted: true,
    isSortedDescending: false,
    onSort: () => undefined,
  },
  render: (args) => (
    <div style={{ padding: 16, border: '1px solid #ccc', minWidth: 120 }}>
      <ColumnHeaderFilter {...args} />
    </div>
  ),
};

export const SortedDescending: Story = {
  args: {
    columnKey: 'name',
    columnName: 'Name',
    filterType: 'none',
    isSorted: true,
    isSortedDescending: true,
    onSort: () => undefined,
  },
  render: (args) => (
    <div style={{ padding: 16, border: '1px solid #ccc', minWidth: 120 }}>
      <ColumnHeaderFilter {...args} />
    </div>
  ),
};

export const WithActiveFilterBadge: Story = {
  args: {
    columnKey: 'status',
    columnName: 'Status',
    filterType: 'multiSelect',
    selectedValues: ['Active'],
    onFilterChange: () => undefined,
    options: ['Active', 'On Hold', 'Closed'],
    onSort: () => undefined,
  },
  render: (args) => (
    <div style={{ padding: 16, border: '1px solid #ccc', minWidth: 140 }}>
      <ColumnHeaderFilter {...args} />
    </div>
  ),
};
