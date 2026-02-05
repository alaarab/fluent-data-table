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

/** Convert IFilters to legacy Record<string, string | string[]> (e.g. for IDataGridQueryParams). UserLike becomes email. */
export function toLegacyFilters(filters: IFilters): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) out[key] = value;
    else if (typeof value === 'string') out[key] = value;
    else if (typeof value === 'object' && value !== null && 'email' in value) out[key] = (value as UserLike).email;
  }
  return out;
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

/** New data source API: fetch a page and optionally filter options / people. */
export interface IDataSource<T> {
  fetchPage(params: IFetchParams): Promise<IPageResult<T>>;
  fetchFilterOptions?(field: string): Promise<string[]>;
  searchPeople?(query: string): Promise<UserLike[]>;
  getUserByEmail?(email: string): Promise<UserLike | undefined>;
}

/**
 * @deprecated Use IDataSource and IFetchParams instead.
 */
export interface IDataGridQueryParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDirection: 'asc' | 'desc';
  /**
   * Filter values keyed by filter field (column filterField or columnId).
   * - Text and multi-select: string or string[].
   * - People filters: pass the selected user's email (or id) as a string for that key
   *   so the server can filter by owner/assignee. The host maps UserLike from the UI
   *   to the value sent here (e.g. filters.ownerEmail = selectedUser?.email).
   */
  filters: Record<string, string | string[]>;
}

/**
 * @deprecated Use IDataSource instead.
 */
export interface IDataGridDataSource<T> {
  getPage(params: IDataGridQueryParams): Promise<{ items: T[]; totalCount: number }>;
  getFilterOptions?(field: string): Promise<string[]>;
  peopleSearch?(query: string): Promise<UserLike[]>;
  getUserByEmail?(email: string): Promise<UserLike | undefined>;
}
