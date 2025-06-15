import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductSQLRepository } from '@infrastructure/data/sql/repositories/products.repository';
import { InstitutionSQLRepository } from '@infrastructure/data/sql/repositories/institution.repository';
import { InstitutionProductSQLRepository } from '@infrastructure/data/sql/repositories/institution-product.repostitoy';
import { ProductDetailsAdapter } from '@core/institution-products/adapter';
import { CreateInstitutionProductInputDto } from '@presentation/institution-product/dto/create.dto';
import { InstitutionProduct } from '@infrastructure/data/sql/entities';

@Injectable()
export class CreateInstitutionProductUseCase {
  constructor(
    private readonly institutionProductRepository: InstitutionProductSQLRepository,
    private readonly productRepository: ProductSQLRepository,
    private readonly institutionRepository: InstitutionSQLRepository,
  ) {}

  async execute(
    input: CreateInstitutionProductInputDto,
  ): Promise<InstitutionProduct> {
    const product = await this.productRepository.findById(input.productId);
    if (!product) {
      throw new NotFoundException(
        `Product with ID ${input.productId} not found`,
      );
    }

    const institution = await this.institutionRepository.findById(
      input.institutionId,
    );
    if (!institution) {
      throw new NotFoundException(
        `Institution with ID ${input.institutionId} not found`,
      );
    }

    const existingRelation =
      await this.institutionProductRepository.findByProductAndInstitution(
        input.productId,
        input.institutionId,
      );

    if (existingRelation) {
      throw new ConflictException(
        `Relation between product ${input.productId} and institution ${input.institutionId} already exists`,
      );
    }

    let typedDetails = null;
    if (input.details) {
      try {
        typedDetails = ProductDetailsAdapter.toTypedDetails(
          input.flag,
          input.details,
        );
      } catch (error) {
        throw new BadRequestException(
          `Invalid details for flag ${input.flag}: ${error.message}`,
        );
      }
    }

    const createdRelation =
      await this.institutionProductRepository.createInstitutionProduct({
        productId: input.productId,
        institutionId: input.institutionId,
        flag: input.flag,
        details: typedDetails,
      });

    const fullRelation = await this.institutionProductRepository.findById(
      createdRelation.id,
    );

    if (!fullRelation) {
      throw new BadRequestException('Failed to retrieve created relation');
    }

    return fullRelation;
  }
}
