import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from '../entities/products.entity';
import { UpdateProductData } from '../types/product.type';
import { ProductFlag } from '../types/product-flag.enum';

@Injectable()
export class ProductSQLRepository {
  constructor(
    @InjectRepository(Product)
    private readonly product: Repository<Product>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const product = this.product.create(productData);
    return await this.product.save(product);
  }

  async findById(id: string): Promise<Product | null> {
    return await this.product.findOne({
      where: { id },
    });
  }

  async findByName(name: string): Promise<Product | null> {
    return await this.product.findOne({
      where: { name },
    });
  }

  async findAllPaginated(
    page = 1,
    limit = 10,
    filters?: {
      flag?: ProductFlag;
      search?: string;
    },
  ): Promise<{
    products: Product[];
    total: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const queryBuilder = this.product
      .createQueryBuilder('product')
      .skip(skip)
      .take(limit);

    if (filters?.flag) {
      queryBuilder.andWhere('product.flag = :flag', { flag: filters.flag });
    }

    if (filters?.search) {
      queryBuilder.andWhere('product.name ILIKE :search', {
        search: `%${filters.search}%`,
      });
    }

    queryBuilder.orderBy('product.updated_at', 'DESC');

    const [products, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      products,
      total,
      totalPages,
    };
  }

  async updateProduct(
    id: string,
    updateData: UpdateProductData,
  ): Promise<Product | null> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const product = await qr.manager.findOne(Product, {
        where: { id },
      });

      if (!product) {
        await qr.rollbackTransaction();
        return null;
      }

      const { name, flag, description, photos, video } = updateData;
      await qr.manager.update(Product, id, {
        name,
        flag,
        description,
        photos,
        video,
        updated_at: new Date(),
      });

      await qr.commitTransaction();
      return this.product.findOne({
        where: { id },
      });
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async hardDelete(id: string): Promise<void> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const product = await qr.manager.findOne(Product, {
        where: { id },
      });

      if (!product) {
        await qr.rollbackTransaction();
        return null;
      }

      await qr.manager.delete(Product, id);
      await qr.commitTransaction();
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }
}
