export interface PagedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      empty: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

/**
 * Pagination request parameters
 */
export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string; // e.g., 'createdAt,desc'
}

/**
 * Helper to build query params for pagination
 */
export function buildPaginationParams(params: PaginationParams): { [key: string]: string } {
  const result: { [key: string]: string } = {};
  if (params.page !== undefined) result['page'] = params.page.toString();
  if (params.size !== undefined) result['size'] = params.size.toString();
  if (params.sort) result['sort'] = params.sort;
  return result;
}