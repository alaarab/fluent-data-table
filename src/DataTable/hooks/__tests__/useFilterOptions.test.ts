import * as React from 'react';
import { act } from '@testing-library/react';
import { createRoot, type Root } from 'react-dom/client';
import { useFilterOptions } from '../useFilterOptions';
import type { IDataGridDataSource } from '../../dataGridTypes';

describe('useFilterOptions', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root.unmount();
      });
    }
    if (container?.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  function Harness({
    dataSource,
    fields,
  }: {
    dataSource: IDataGridDataSource<unknown>;
    fields: string[];
  }): React.ReactElement {
    const result = useFilterOptions(dataSource, fields);
    return React.createElement('pre', { 'data-testid': 'result' }, JSON.stringify(result));
  }

  function renderAndGetResult(dataSource: IDataGridDataSource<unknown>, fields: string[]): unknown {
    act(() => {
      root.render(React.createElement(Harness, { dataSource, fields }));
    });
    const pre = container.querySelector('[data-testid="result"]');
    return pre ? JSON.parse(pre.textContent || '{}') : {};
  }

  const minimalDataSource = (): IDataGridDataSource<unknown> => ({
    getPage: jest.fn().mockResolvedValue({ items: [], totalCount: 0 }),
  });

  it('returns empty filterOptions and loadingOptions when getFilterOptions is missing', async () => {
    const dataSource = minimalDataSource();
    renderAndGetResult(dataSource, ['a', 'b']);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    const after = JSON.parse(container.querySelector('[data-testid="result"]')?.textContent || '{}');
    expect(after.filterOptions).toEqual({});
    expect(after.loadingOptions).toEqual({});
  });

  it('loads filter options via getFilterOptions and populates filterOptions', async () => {
    const resolvers: Record<string, (v: string[]) => void> = {};
    const dataSource: IDataGridDataSource<unknown> = {
      ...minimalDataSource(),
      getFilterOptions: jest.fn((field: string) => new Promise((resolve) => { resolvers[field] = resolve; })),
    };
    renderAndGetResult(dataSource, ['client', 'stage']);

    await act(async () => {
      resolvers.client(['Acme', 'Beta']);
      resolvers.stage(['Active', 'Closed']);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const after = JSON.parse(container.querySelector('[data-testid="result"]')?.textContent || '{}');
    expect(after.filterOptions).toEqual({ client: ['Acme', 'Beta'], stage: ['Active', 'Closed'] });
    expect(after.loadingOptions).toEqual({});
    expect(dataSource.getFilterOptions).toHaveBeenCalledWith('client');
    expect(dataSource.getFilterOptions).toHaveBeenCalledWith('stage');
  });

  it('sets a field to empty array when getFilterOptions throws', async () => {
    const dataSource: IDataGridDataSource<unknown> = {
      ...minimalDataSource(),
      getFilterOptions: jest.fn((field: string) =>
        field === 'bad' ? Promise.reject(new Error('fail')) : Promise.resolve(['ok'])
      ),
    };
    renderAndGetResult(dataSource, ['good', 'bad']);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const after = JSON.parse(container.querySelector('[data-testid="result"]')?.textContent || '{}');
    expect(after.filterOptions).toEqual({ good: ['ok'], bad: [] });
    expect(after.loadingOptions).toEqual({});
    consoleSpy.mockRestore();
  });
});
