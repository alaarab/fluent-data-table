import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { PaginationControls } from './PaginationControls';

const meta: Meta<typeof PaginationControls> = {
  title: 'DataTable/PaginationControls',
  component: PaginationControls,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(20);

    return (
      <div style={{ padding: 16 }}>
        <PaginationControls
          currentPage={page}
          pageSize={pageSize}
          totalCount={137}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          entityLabelPlural="rows"
        />
      </div>
    );
  },
};

export const FirstPage: Story = {
  render: () => {
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(20);
    return (
      <div style={{ padding: 16 }}>
        <PaginationControls
          currentPage={page}
          pageSize={pageSize}
          totalCount={250}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          entityLabelPlural="items"
        />
      </div>
    );
  },
};

export const ManyPages: Story = {
  render: () => {
    const [page, setPage] = React.useState(5);
    const [pageSize, setPageSize] = React.useState(10);
    return (
      <div style={{ padding: 16 }}>
        <PaginationControls
          currentPage={page}
          pageSize={pageSize}
          totalCount={500}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          entityLabelPlural="rows"
        />
      </div>
    );
  },
};

export const SinglePage: Story = {
  render: () => {
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(20);
    return (
      <div style={{ padding: 16 }}>
        <PaginationControls
          currentPage={page}
          pageSize={pageSize}
          totalCount={5}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          entityLabelPlural="items"
        />
      </div>
    );
  },
};

