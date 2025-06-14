import { User } from '@infrastructure/data/sql/entities';

export class PaginatedUsersEntity {
  users: User[];
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;

  constructor(data: {
    users: User[];
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  }) {
    this.users = data.users;
    this.total = data.total;
    this.totalPages = data.totalPages;
    this.currentPage = data.currentPage;
    this.limit = data.limit;
    this.hasNext = data.currentPage < data.totalPages;
    this.hasPrevious = data.currentPage > 1;
  }
}
