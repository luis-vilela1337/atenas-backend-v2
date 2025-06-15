import { InstitutionProduct } from '@infrastructure/data/sql/entities';
import { UpdateInstitutionProductResponseDto } from '@presentation/institution-product/dto/update.dto';

export class UpdateInstitutionProductAdapter {
  static toResponseDto(
    institutionProduct: InstitutionProduct,
  ): UpdateInstitutionProductResponseDto {
    return {
      id: institutionProduct.id,
      productId: institutionProduct.product.id,
      institutionId: institutionProduct.institution.id,
      flag: institutionProduct.flag,
      details: institutionProduct.details,
      createdAt: institutionProduct.createdAt,
      updatedAt: institutionProduct.updatedAt,
    };
  }
}
