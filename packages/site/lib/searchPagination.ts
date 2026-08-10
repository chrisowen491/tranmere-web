export const SEARCH_PAGE_SIZE = 50;
export const SEARCH_MAX_PAGE_SIZE = 100;

export interface SearchPagination {
  cursor: number;
  limit: number;
}

export interface SearchPage {
  cursor: number;
  limit: number;
  nextCursor: number | null;
}

function integer(value: string | null) {
  if (value === null || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

export function readSearchPagination(
  params: URLSearchParams,
): SearchPagination {
  const requestedLimit = integer(params.get("limit"));
  const requestedCursor = integer(params.get("cursor"));

  return {
    limit: Math.min(
      SEARCH_MAX_PAGE_SIZE,
      Math.max(1, requestedLimit ?? SEARCH_PAGE_SIZE),
    ),
    cursor: Math.max(0, requestedCursor ?? 0),
  };
}

export function createSearchPage<T>(
  rows: T[],
  pagination: SearchPagination,
): { rows: T[]; pagination: SearchPage } {
  const hasNextPage = rows.length > pagination.limit;
  return {
    rows: hasNextPage ? rows.slice(0, pagination.limit) : rows,
    pagination: {
      ...pagination,
      nextCursor: hasNextPage ? pagination.cursor + pagination.limit : null,
    },
  };
}
