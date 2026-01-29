import { useState, useEffect, useCallback } from 'react';
import type { IDataGridDataSource } from '../dataGridTypes';

export interface UseFilterOptionsResult {
  filterOptions: Record<string, string[]>;
  loadingOptions: Record<string, boolean>;
}

export function useFilterOptions(
  dataSource: IDataGridDataSource<unknown>,
  fields: string[]
): UseFilterOptionsResult {
  const [filterOptions, setFilterOptions] = useState<Record<string, string[]>>({});
  const [loadingOptions, setLoadingOptions] = useState<Record<string, boolean>>({});

  const load = useCallback(async (): Promise<void> => {
    if (!dataSource.getFilterOptions) {
      setFilterOptions({});
      setLoadingOptions({});
      return;
    }
    const loading: Record<string, boolean> = {};
    fields.forEach((f) => { loading[f] = true; });
    setLoadingOptions(loading);

    const results: Record<string, string[]> = {};
    await Promise.all(
      fields.map(async (field) => {
        try {
          results[field] = await dataSource.getFilterOptions!(field);
        } catch (e) {
          console.error(`Error loading filter options for ${field}:`, e);
          results[field] = [];
        }
      })
    );

    setFilterOptions(results);
    setLoadingOptions({});
  }, [dataSource, fields.join(',')]);

  useEffect(() => {
    load().catch(console.error);
  }, [load]);

  return { filterOptions, loadingOptions };
}
