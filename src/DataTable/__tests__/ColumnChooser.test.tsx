import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColumnChooser } from '../ColumnChooser/ColumnChooser';

describe('ColumnChooser', () => {
  const columns = [
    { columnId: 'a', name: 'Col A' },
    { columnId: 'b', name: 'Col B' },
  ];

  it('opens dropdown and toggles column visibility', () => {
    const onVisibilityChange = jest.fn();
    render(
      <ColumnChooser
        columns={columns}
        visibleColumns={new Set(['a'])}
        onVisibilityChange={onVisibilityChange}
      />
    );

    const trigger = screen.getByRole('button', { name: /column visibility/i });
    fireEvent.click(trigger);

    const checkboxB = screen.getByLabelText('Col B');
    fireEvent.click(checkboxB);

    expect(onVisibilityChange).toHaveBeenCalledWith('b', true);
  });

  it('clear all hides non-required visible columns', () => {
    const onVisibilityChange = jest.fn();
    render(
      <ColumnChooser
        columns={[{ columnId: 'id', name: 'ID', required: true }, ...columns]}
        visibleColumns={new Set(['id', 'a', 'b'])}
        onVisibilityChange={onVisibilityChange}
      />
    );

    const trigger = screen.getByRole('button', { name: /column visibility/i });
    fireEvent.click(trigger);

    const clearAll = screen.getByRole('button', { name: /clear all/i });
    fireEvent.click(clearAll);

    expect(onVisibilityChange).toHaveBeenCalledWith('a', false);
    expect(onVisibilityChange).toHaveBeenCalledWith('b', false);
    expect(onVisibilityChange).not.toHaveBeenCalledWith('id', false);
  });
});

