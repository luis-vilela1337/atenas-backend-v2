import { InstitutionProduct } from '@infrastructure/data/sql/entities';
import { CreateInstitutionProductResponseDto } from '@presentation/institution-product/dto/create.dto';

export class CreateInstitutionProductAdapter {
  static toResponseDto(
    institutionProduct: InstitutionProduct,
  ): CreateInstitutionProductResponseDto {
    return {
      id: institutionProduct.id,
      productId: institutionProduct.product.id,
      institutionId: institutionProduct.institution.id,
      flag: institutionProduct.flag,
      details: institutionProduct.details,
      createdAt: institutionProduct.createdAt,
    };
  }
}
