export interface FindOrdersFilter {
  userId?: string;
  paymentStatus?:
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | 'CANCELLED'
    | 'COMPLETED';
}

export interface FindOrdersPagination {
  page: number;
  limit: number;
}

export interface FindOrdersInput {
  filter?: FindOrdersFilter;
  pagination: FindOrdersPagination;
}

export interface FindOrdersResult {
  orders: any[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  itemCount: number;
}
