/**
 * Pagination DTO
 */
export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function createPaginationDTO(
  page: number,
  limit: number,
  total: number
): PaginationDTO {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

