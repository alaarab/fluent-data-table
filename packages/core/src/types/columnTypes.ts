import * as React from 'react';

export type ColumnFilterType = 'none' | 'text' | 'multiSelect' | 'people';

export interface IColumnFilterDef {
  type: Exclude<ColumnFilterType, 'none'>;
  filterField?: string;
  optionsSource?: 'api' | 'static' | 'years';
  options?: string[];
  yearsCount?: number;
}

export interface IColumnMeta {
  columnId: string;
  name: string;
  sortable?: boolean;
  filterable?: false | IColumnFilterDef;
  defaultVisible?: boolean;
  required?: boolean;
  minWidth?: number;
  defaultWidth?: number;
  idealWidth?: number;
}

export interface IColumnDef<T = unknown> extends IColumnMeta {
  renderCell?: (item: T) => React.ReactNode;
  compare?: (a: T, b: T) => number;
}

/** Minimal column info for the ColumnChooser (framework-agnostic). */
export interface IColumnDefinition {
  columnId: string;
  name: string;
  required?: boolean;
}
