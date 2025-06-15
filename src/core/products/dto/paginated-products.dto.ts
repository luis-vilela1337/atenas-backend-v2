import { Product } from '@infrastructure/data/sql/entities/products.entity';

export class PaginatedProductsEntity {
  products: Product[];
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;

  constructor(data: {
    products: Product[];
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  }) {
    this.products = data.products;
    this.total = data.total;
    this.totalPages = data.totalPages;
    this.currentPage = data.currentPage;
    this.limit = data.limit;
  }
}
