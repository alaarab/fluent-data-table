import * as React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ColumnHeaderFilter } from '../ColumnHeaderFilter/ColumnHeaderFilter';
import type { UserLike } from '../dataGridTypes';

describe('ColumnHeaderFilter', () => {
  it('applies multi-select filters and calls onFilterChange', () => {
    const onFilterChange = jest.fn();

    render(
      <ColumnHeaderFilter
        columnKey="status"
        columnName="Status"
        filterType="multiSelect"
        selectedValues={[]}
        onFilterChange={onFilterChange}
        options={['Active', 'Closed']}
      />,
    );

    const filterButton = screen.getByRole('button', { name: /filter status/i });
    fireEvent.click(filterButton);

    const selectAllButton = screen.getByRole('button', { name: /select all/i });
    fireEvent.click(selectAllButton);

    const applyButton = screen.getByRole('button', { name: /apply/i });
    fireEvent.click(applyButton);

    expect(onFilterChange).toHaveBeenCalledWith(['Active', 'Closed']);
  });

  it('applies text filter and calls onTextChange', () => {
    const onTextChange = jest.fn();

    render(
      <ColumnHeaderFilter
        columnKey="name"
        columnName="Name"
        filterType="text"
        textValue=""
        onTextChange={onTextChange}
      />,
    );

    const filterButton = screen.getByRole('button', { name: /filter name/i });
    fireEvent.click(filterButton);

    const input = screen.getByPlaceholderText(/enter search term/i);
    fireEvent.change(input, { target: { value: 'Alpha' } });

    const applyButton = screen.getByRole('button', { name: /apply/i });
    fireEvent.click(applyButton);

    expect(onTextChange).toHaveBeenCalledWith('Alpha');
  });

  it('debounces peopleSearch and selects a user', async () => {
    jest.useFakeTimers();

    const alice: UserLike = {
      id: '1',
      displayName: 'Alice Johnson',
      email: 'alice@example.com',
      photo: undefined,
    };

    const peopleSearch = jest.fn<Promise<UserLike[]>, [string]>().mockResolvedValue([alice]);
    const onUserChange = jest.fn();

    render(
      <ColumnHeaderFilter
        columnKey="owner"
        columnName="Owner"
        filterType="people"
        selectedUser={undefined}
        onUserChange={onUserChange}
        peopleSearch={peopleSearch}
      />,
    );

    const filterButton = screen.getByRole('button', { name: /filter owner/i });
    fireEvent.click(filterButton);

    const input = screen.getByPlaceholderText(/search for a person/i);
    fireEvent.change(input, { target: { value: 'ali' } });

    await act(async () => {
      jest.advanceTimersByTime(350);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(peopleSearch).toHaveBeenCalledWith('ali');
    });

    const [suggestion] = await screen.findAllByText('Alice Johnson');
    fireEvent.click(suggestion);

    expect(onUserChange).toHaveBeenCalledWith(
      expect.objectContaining({ displayName: 'Alice Johnson', email: 'alice@example.com' }),
    );

    jest.useRealTimers();
  });
});

