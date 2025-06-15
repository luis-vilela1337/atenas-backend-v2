import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InstitutionProductSQLRepository } from '@infrastructure/data/sql/repositories/institution-product.repostitoy';
import { ProductDetailsAdapter } from '@core/institution-products/adapter';
import { UpdateInstitutionProductInputDto } from '@presentation/institution-product/dto/update.dto';
import { InstitutionProduct } from '@infrastructure/data/sql/entities';

@Injectable()
export class UpdateInstitutionProductUseCase {
  constructor(
    private readonly institutionProductRepository: InstitutionProductSQLRepository,
  ) {}

  async execute(
    id: string,
    input: UpdateInstitutionProductInputDto,
  ): Promise<InstitutionProduct> {
    const existingRelation = await this.institutionProductRepository.findById(
      id,
    );
    if (!existingRelation) {
      throw new NotFoundException(
        `Institution product relation with ID ${id} not found`,
      );
    }

    let typedDetails = null;
    if (input.details) {
      try {
        typedDetails = ProductDetailsAdapter.toTypedDetails(
          existingRelation.flag,
          input.details,
        );
      } catch (error) {
        throw new BadRequestException(
          `Invalid details for flag ${existingRelation.flag}: ${error.message}`,
        );
      }
    }

    const updatedRelation =
      await this.institutionProductRepository.updateInstitutionProduct(id, {
        details: typedDetails,
      });

    if (!updatedRelation) {
      throw new BadRequestException(
        'Failed to update institution product relation',
      );
    }

    return updatedRelation;
  }
}
