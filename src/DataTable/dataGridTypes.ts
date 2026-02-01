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

export interface IDataGridDataSource<T> {
  getPage(params: IDataGridQueryParams): Promise<{ items: T[]; totalCount: number }>;
  getFilterOptions?(field: string): Promise<string[]>;
  peopleSearch?(query: string): Promise<UserLike[]>;
  getUserByEmail?(email: string): Promise<UserLike | undefined>;
}
