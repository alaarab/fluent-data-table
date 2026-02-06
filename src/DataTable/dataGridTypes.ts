export interface UserLike {
  id?: string;
  displayName: string;
  email: string;
  photo?: string;
}

export function toUserLike(
  u: { displayName: string; mail?: string; userPrincipalName?: string; email?: string; id?: string; photo?: string } | undefined
): UserLike | undefined {
  if (!u) return undefined;
  return {
    id: u.id,
    displayName: u.displayName,
    email: 'email' in u && u.email ? u.email : (u.mail || u.userPrincipalName || ''),
    photo: u.photo
  };
}

/** Unified filter values: text (string), multi-select (string[]), or people (UserLike). */
export interface IFilters {
  [field: string]: string | string[] | UserLike | undefined;
}

/** Split IFilters into DataGridTable's multiSelect, text, and people props. */
export function toDataGridFilterProps(filters: IFilters): {
  multiSelectFilters: Record<string, string[]>;
  textFilters: Record<string, string>;
  peopleFilters: Record<string, UserLike | undefined>;
} {
  const multiSelectFilters: Record<string, string[]> = {};
  const textFilters: Record<string, string> = {};
  const peopleFilters: Record<string, UserLike | undefined> = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) multiSelectFilters[key] = value;
    else if (typeof value === 'string') textFilters[key] = value;
    else if (typeof value === 'object' && value !== null && 'email' in value) peopleFilters[key] = value as UserLike;
  }
  return { multiSelectFilters, textFilters, peopleFilters };
}

export interface IFetchParams {
  page: number;
  pageSize: number;
  sort?: { field: string; direction: 'asc' | 'desc' };
  filters: IFilters;
}

export interface IPageResult<T> {
  items: T[];
  totalCount: number;
}

/** Data source API: fetch a page and optionally filter options / people. */
export interface IDataSource<T> {
  fetchPage(params: IFetchParams): Promise<IPageResult<T>>;
  fetchFilterOptions?(field: string): Promise<string[]>;
  searchPeople?(query: string): Promise<UserLike[]>;
  getUserByEmail?(email: string): Promise<UserLike | undefined>;
}
