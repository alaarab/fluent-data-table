import * as React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ColumnHeaderFilter } from '../ColumnHeaderFilter/ColumnHeaderFilter';
import type { UserLike } from '@alaarab/ogrid-core';

describe('ColumnHeaderFilter (Material)', () => {
  it('renders no filter button when filterType is none', () => {
    render(<ColumnHeaderFilter columnKey="id" columnName="ID" filterType="none" onSort={() => undefined} />);
    expect(screen.getByRole('button', { name: /sort by id/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /filter id/i })).not.toBeInTheDocument();
  });

  it('calls onSort when sort button clicked', () => {
    const onSort = jest.fn();
    render(<ColumnHeaderFilter columnKey="name" columnName="Name" filterType="none" onSort={onSort} />);
    fireEvent.click(screen.getByRole('button', { name: /sort by name/i }));
    expect(onSort).toHaveBeenCalledTimes(1);
  });

  it('applies multi-select filters and calls onFilterChange', () => {
    const onFilterChange = jest.fn();
    render(<ColumnHeaderFilter columnKey="status" columnName="Status" filterType="multiSelect" selectedValues={[]} onFilterChange={onFilterChange} options={['Active', 'Closed']} />);
    fireEvent.click(screen.getByRole('button', { name: /filter status/i }));
    fireEvent.click(screen.getByRole('button', { name: /select all/i }));
    fireEvent.click(screen.getByRole('button', { name: /apply/i }));
    expect(onFilterChange).toHaveBeenCalledWith(['Active', 'Closed']);
  });

  it('Clear in multiSelect resets selection and Apply sends it', () => {
    const onFilterChange = jest.fn();
    render(<ColumnHeaderFilter columnKey="status" columnName="Status" filterType="multiSelect" selectedValues={['Active']} onFilterChange={onFilterChange} options={['Active', 'Closed']} />);
    fireEvent.click(screen.getByRole('button', { name: /filter status/i }));
    const clearButtons = screen.getAllByRole('button', { name: /^clear$/i });
    fireEvent.click(clearButtons[clearButtons.length - 1]);
    fireEvent.click(screen.getByRole('button', { name: /apply/i }));
    expect(onFilterChange).toHaveBeenCalledWith([]);
  });

  it('applies text filter and calls onTextChange', () => {
    const onTextChange = jest.fn();
    render(<ColumnHeaderFilter columnKey="name" columnName="Name" filterType="text" textValue="" onTextChange={onTextChange} />);
    fireEvent.click(screen.getByRole('button', { name: /filter name/i }));
    const input = screen.getByPlaceholderText(/enter search term/i);
    fireEvent.change(input, { target: { value: 'Alpha' } });
    fireEvent.click(screen.getByRole('button', { name: /apply/i }));
    expect(onTextChange).toHaveBeenCalledWith('Alpha');
  });

  it('debounces peopleSearch and selects a user', async () => {
    jest.useFakeTimers();
    const alice: UserLike = { id: '1', displayName: 'Alice Johnson', email: 'alice@example.com', photo: undefined };
    const peopleSearch = jest.fn<Promise<UserLike[]>, [string]>().mockResolvedValue([alice]);
    const onUserChange = jest.fn();
    render(<ColumnHeaderFilter columnKey="owner" columnName="Owner" filterType="people" selectedUser={undefined} onUserChange={onUserChange} peopleSearch={peopleSearch} />);
    fireEvent.click(screen.getByRole('button', { name: /filter owner/i }));
    const input = screen.getByPlaceholderText(/search for a person/i);
    fireEvent.change(input, { target: { value: 'ali' } });
    await act(async () => { jest.advanceTimersByTime(350); await Promise.resolve(); });
    await waitFor(() => { expect(peopleSearch).toHaveBeenCalledWith('ali'); });
    const [suggestion] = await screen.findAllByText('Alice Johnson');
    fireEvent.click(suggestion);
    expect(onUserChange).toHaveBeenCalledWith(expect.objectContaining({ displayName: 'Alice Johnson', email: 'alice@example.com' }));
    jest.useRealTimers();
  });
});
