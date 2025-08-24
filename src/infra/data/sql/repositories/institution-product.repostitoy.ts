import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { ProductFlag } from '../types/product-flag.enum';
import {
  InstitutionProduct,
  ProductDetails,
  GenericDetails,
  DigitalFilesDetails,
} from '@infrastructure/data/sql/entities';
import { InstitutionEventSQLRepository } from '@infrastructure/data/sql/repositories/institution-event.repository';

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
    private readonly institutionEventRepository: InstitutionEventSQLRepository,
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
    const product = await this.institutionProduct.findOne({
      where: { id },
      relations: ['product', 'institution'],
    });

    if (!product) {
      return null;
    }

    const [productWithEventNames] = await this.populateEventNames([product]);
    return productWithEventNames;
  }

  async findByProductAndInstitution(
    productId: string,
    institutionId: string,
  ): Promise<InstitutionProduct | null> {
    const product = await this.institutionProduct.findOne({
      where: {
        product: { id: productId },
        institution: { id: institutionId },
      },
      relations: ['product', 'institution'],
    });

    if (!product) {
      return null;
    }

    const [productWithEventNames] = await this.populateEventNames([product]);
    return productWithEventNames;
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

    // Populate event names for products with GENERIC or DIGITAL_FILES flags
    const institutionProductsWithEventNames = await this.populateEventNames(
      institutionProducts,
    );

    return {
      institutionProducts: institutionProductsWithEventNames,
      total,
      totalPages,
    };
  }

  private async populateEventNames(
    institutionProducts: InstitutionProduct[],
  ): Promise<InstitutionProduct[]> {
    return Promise.all(
      institutionProducts.map(async (product) => {
        // Only populate event names for GENERIC and DIGITAL_FILES flags
        if (
          product.flag === ProductFlag.GENERIC ||
          product.flag === ProductFlag.DIGITAL_FILES
        ) {
          const details = product.details as
            | GenericDetails
            | DigitalFilesDetails;

          if (details && details.events && details.events.length > 0) {
            // Get all event IDs from the details
            const eventIds = details.events.map((event) => event.id);

            // Fetch event names from the database
            const events = await this.institutionEventRepository.findByIds(
              eventIds,
            );

            // Create a map for quick lookup
            const eventNameMap = new Map(
              events.map((event) => [event.id, event.name]),
            );

            // Update the events with names
            const updatedEvents = details.events.map((event) => ({
              ...event,
              name: eventNameMap.get(event.id) || undefined,
            }));

            // Return the product with updated details
            return {
              ...product,
              details: {
                ...details,
                events: updatedEvents,
              },
            };
          }
        }

        return product;
      }),
    );
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
    const products = await this.institutionProduct.find({
      where: { institution: { id: institutionId } },
      relations: ['product', 'institution'],
      order: { updatedAt: 'DESC' },
    });

    return await this.populateEventNames(products);
  }

  async findByProductId(productId: string): Promise<InstitutionProduct[]> {
    const products = await this.institutionProduct.find({
      where: { product: { id: productId } },
      relations: ['product', 'institution'],
      order: { updatedAt: 'DESC' },
    });

    return await this.populateEventNames(products);
  }
}
