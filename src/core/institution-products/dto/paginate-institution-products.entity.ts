import { InstitutionProduct } from '@infrastructure/data/sql/entities';

export class PaginatedInstitutionProductsEntity {
  institutionProducts: InstitutionProduct[];
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;

  constructor(data: {
    institutionProducts: InstitutionProduct[];
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  }) {
    this.institutionProducts = data.institutionProducts;
    this.total = data.total;
    this.totalPages = data.totalPages;
    this.currentPage = data.currentPage;
    this.limit = data.limit;
    this.hasNext = data.currentPage < data.totalPages;
    this.hasPrevious = data.currentPage > 1;
  }
}
