import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { ColumnChooser, type IColumnDefinition } from './ColumnChooser';

const meta: Meta<typeof ColumnChooser> = {
  title: 'DataTable/ColumnChooser',
  component: ColumnChooser,
};

export default meta;
type Story = StoryObj<typeof meta>;

const demoColumns: IColumnDefinition[] = [
  { columnId: 'id', name: 'ID', required: true },
  { columnId: 'name', name: 'Name' },
  { columnId: 'status', name: 'Status' },
];

export const Default: Story = {
  render: () => {
    const [visible, setVisible] = React.useState<Set<string>>(
      () => new Set(demoColumns.map((c) => c.columnId)),
    );

    const handleVisibilityChange = (columnKey: string, isVisible: boolean) => {
      setVisible((prev) => {
        const next = new Set(prev);
        if (isVisible) next.add(columnKey);
        else next.delete(columnKey);
        return next;
      });
    };

    return (
      <div style={{ padding: 16 }}>
        <ColumnChooser
          columns={demoColumns}
          visibleColumns={visible}
          onVisibilityChange={handleVisibilityChange}
        />
      </div>
    );
  },
};

const manyColumns: IColumnDefinition[] = [
  { columnId: 'id', name: 'ID', required: true },
  { columnId: 'name', name: 'Name' },
  { columnId: 'status', name: 'Status' },
  { columnId: 'owner', name: 'Owner' },
  { columnId: 'date', name: 'Date' },
  { columnId: 'type', name: 'Type' },
];

export const ManyColumns: Story = {
  render: () => {
    const [visible, setVisible] = React.useState<Set<string>>(
      () => new Set(manyColumns.map((c) => c.columnId)),
    );
    return (
      <div style={{ padding: 16 }}>
        <ColumnChooser
          columns={manyColumns}
          visibleColumns={visible}
          onVisibilityChange={(key, isVisible) => {
            setVisible((prev) => {
              const next = new Set(prev);
              if (isVisible) next.add(key);
              else next.delete(key);
              return next;
            });
          }}
        />
      </div>
    );
  },
};

export const SomeHidden: Story = {
  render: () => {
    const [visible, setVisible] = React.useState<Set<string>>(
      () => new Set([demoColumns[0].columnId, demoColumns[1].columnId]),
    );
    return (
      <div style={{ padding: 16 }}>
        <ColumnChooser
          columns={demoColumns}
          visibleColumns={visible}
          onVisibilityChange={(key, isVisible) => {
            setVisible((prev) => {
              const next = new Set(prev);
              if (isVisible) next.add(key);
              else next.delete(key);
              return next;
            });
          }}
        />
      </div>
    );
  },
};

