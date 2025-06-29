import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { ProductFlag } from '../types/product-flag.enum';
import { InstitutionProduct, ProductDetails, } from '@infrastructure/data/sql/entities';

export interface CreateInstitutionProductData {
  productId: string;
  institutionId: string;
  flag: ProductFlag;
  details?: ProductDetails;
}

export interface UpdateInstitutionProductData {
  flag?: ProductFlag;
  details?: ProductDetails;
}

interface InstitutionProductFilters {
  productId?: string;
  institutionId?: string;
  flag?: ProductFlag;
}

@Injectable()
export class InstitutionProductSQLRepository {
  constructor(
    @InjectRepository(InstitutionProduct)
    private readonly institutionProduct: Repository<InstitutionProduct>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async createInstitutionProduct(
    data: CreateInstitutionProductData,
  ): Promise<InstitutionProduct> {
    const institutionProduct = this.institutionProduct.create({
      product: { id: data.productId },
      institution: { id: data.institutionId },
      flag: data.flag,
      details: data.details || null,
    });

    return await this.institutionProduct.save(institutionProduct);
  }

  async findById(id: string): Promise<InstitutionProduct | null> {
    return await this.institutionProduct.findOne({
      where: { id },
      relations: ['product', 'institution'],
    });
  }

  async findByProductAndInstitution(
    productId: string,
    institutionId: string,
  ): Promise<InstitutionProduct | null> {
    return await this.institutionProduct.findOne({
      where: {
        product: { id: productId },
        institution: { id: institutionId },
      },
      relations: ['product', 'institution'],
    });
  }

  async findAllPaginated(
    page = 1,
    limit = 10,
    filters?: InstitutionProductFilters,
  ): Promise<{
    institutionProducts: InstitutionProduct[];
    total: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const queryBuilder = this.institutionProduct
      .createQueryBuilder('ip')
      .leftJoinAndSelect('ip.product', 'product')
      .leftJoinAndSelect('ip.institution', 'institution')
      .skip(skip)
      .take(limit);

    if (filters?.productId) {
      queryBuilder.andWhere('ip.product.id = :productId', {
        productId: filters.productId,
      });
    }

    if (filters?.institutionId) {
      queryBuilder.andWhere('ip.institution.id = :institutionId', {
        institutionId: filters.institutionId,
      });
    }

    if (filters?.flag) {
      queryBuilder.andWhere('ip.flag = :flag', {
        flag: filters.flag,
      });
    }

    queryBuilder.orderBy('ip.updatedAt', 'DESC');

    const [institutionProducts, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      institutionProducts,
      total,
      totalPages,
    };
  }

  async updateInstitutionProduct(
    id: string,
    updateData: UpdateInstitutionProductData,
  ): Promise<InstitutionProduct | null> {
    const qr = this.dataSource.createQueryRunner();

    await qr.connect();
    await qr.startTransaction();

    try {
      const existingRelation = await qr.manager.findOne(InstitutionProduct, {
        where: { id },
        relations: ['product', 'institution'],
      });

      if (!existingRelation) {
        await qr.rollbackTransaction();
        return null;
      }

      await qr.manager.update(InstitutionProduct, id, updateData);

      const updatedRelation = await qr.manager.findOne(InstitutionProduct, {
        where: { id },
        relations: ['product', 'institution'],
      });

      await qr.commitTransaction();
      return updatedRelation;
    } catch (error) {
      await qr.rollbackTransaction();
      throw error;
    } finally {
      await qr.release();
    }
  }

  async deleteInstitutionProduct(id: string): Promise<boolean> {
    const result = await this.institutionProduct.delete(id);
    return result.affected !== undefined && result.affected > 0;
  }

  async findByInstitutionId(
    institutionId: string,
  ): Promise<InstitutionProduct[]> {
    return await this.institutionProduct.find({
      where: { institution: { id: institutionId } },
      relations: ['product', 'institution'],
      order: { updatedAt: 'DESC' },
    });
  }

  async findByProductId(productId: string): Promise<InstitutionProduct[]> {
    return await this.institutionProduct.find({
      where: { product: { id: productId } },
      relations: ['product', 'institution'],
      order: { updatedAt: 'DESC' },
    });
  }
}
