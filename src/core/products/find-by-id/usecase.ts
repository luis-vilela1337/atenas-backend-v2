import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductSQLRepository } from '@infrastructure/data/sql/repositories/products.repository';
import { Product } from '@infrastructure/data/sql/entities/products.entity';
import { ImageStorageService } from '@infrastructure/services/image-storage.service';

@Injectable()
export class FindProductByIdUseCase {
  constructor(
    private readonly productRepository: ProductSQLRepository,
    private readonly imageStorageService: ImageStorageService,
  ) {}

  async execute(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    // Generate signed URLs for photos and videos
    if (product.photos && product.photos.length > 0) {
      product.photos = await Promise.all(
        product.photos.map(
          async (photo) =>
            await this.imageStorageService.generateSignedUrl(photo, 'read'),
        ),
      );
    }

    if (product.video && product.video.length > 0) {
      product.video = await Promise.all(
        product.video.map(
          async (video) =>
            await this.imageStorageService.generateSignedUrl(video, 'read'),
        ),
      );
    }

    return product;
  }
}
