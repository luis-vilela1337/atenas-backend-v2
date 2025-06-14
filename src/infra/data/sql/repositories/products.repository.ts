import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Product } from '../entities/products.entity';
import { UpdateProductData } from '../types/product.type';

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

  async findAll(): Promise<Product[]> {
    return await this.product.find({
      order: { created_at: 'DESC' },
    });
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

      const { name, flag, description } = updateData;
      await qr.manager.update(Product, id, {
        name,
        flag,
        description,
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
