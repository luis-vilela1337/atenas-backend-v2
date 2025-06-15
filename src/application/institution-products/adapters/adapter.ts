import { PaginationMetaDto } from '@presentation/user/dto/pagination-meta.dto';
import { InstitutionProduct } from '@infrastructure/data/sql/entities';
import { InstitutionProductDto } from '@presentation/institution-product/dto/dto';
import { CreateInstitutionProductResponseDto } from '@presentation/institution-product/dto/create.dto';
import { PaginatedInstitutionProductsEntity } from '@core/institution-products/dto/paginate-institution-products.entity';
import { PaginatedInstitutionProductsDto } from '@presentation/institution-product/dto/list-all.dto';

export class InstitutionProductMapper {
  static toDto(relation: InstitutionProduct): InstitutionProductDto {
    return {
      id: relation.id,
      product: {
        id: relation.product.id,
        name: relation.product.name,
        flag: relation.product.flag,
      },
      institution: {
        id: relation.institution.id,
        name: relation.institution.name,
        contractNumber: relation.institution.contractNumber,
      },
      flag: relation.flag,
      details: relation.details,
      createdAt: relation.createdAt,
      updatedAt: relation.updatedAt,
    };
  }

  static toCreateResponseDto(
    relation: InstitutionProduct,
  ): CreateInstitutionProductResponseDto {
    return {
      id: relation.id,
      productId: relation.product.id,
      institutionId: relation.institution.id,
      flag: relation.flag,
      details: relation.details,
      createdAt: relation.createdAt,
    };
  }

  static toDtoArray(relations: InstitutionProduct[]): InstitutionProductDto[] {
    return relations.map((relation) => this.toDto(relation));
  }

  static toPaginatedDto(
    useCaseResult: PaginatedInstitutionProductsEntity,
  ): PaginatedInstitutionProductsDto {
    const paginationMeta: PaginationMetaDto = {
      total: useCaseResult.total,
      totalPages: useCaseResult.totalPages,
      page: useCaseResult.currentPage,
      limit: useCaseResult.limit,
    };

    return {
      data: this.toDtoArray(useCaseResult.institutionProducts),
      pagination: paginationMeta,
    };
  }
}
