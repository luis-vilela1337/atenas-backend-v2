import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateProductApplication } from '@application/products/create-product.application';
import {
  CreateProductInputDto,
  CreateProductResponseDto,
} from '../dto/create-product.dto';

@ApiTags('products')
@Controller('v2/products')
export class ProductsController {
  constructor(private readonly createProductApp: CreateProductApplication) {}

  @Post('/')
  @ApiOperation({ summary: 'Criar um novo produto' })
  @ApiBody({ type: CreateProductInputDto })
  @ApiResponse({ status: 201, type: CreateProductResponseDto })
  @HttpCode(HttpStatus.CREATED)
  async createProduct(
    @Body() dto: CreateProductInputDto,
  ): Promise<CreateProductResponseDto> {
    return await this.createProductApp.execute(dto);
  }
}
