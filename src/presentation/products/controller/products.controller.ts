import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateProductApplication } from '@application/products/create-product.application';
import {
  CreateProductInputDto,
  CreateProductResponseDto,
} from '../dto/create-product.dto';
import { FindAllProductsApplication } from '@application/products/find-all-products.application';
import { ListProductsQueryDto } from '../dto/list-products-query.dto';
import { PaginatedProductsDto } from '../dto/paginated-products.dto';

@ApiTags('products')
@Controller('v2/products')
export class ProductsController {
  constructor(
    private readonly createProductApp: CreateProductApplication,
    private readonly findAllProductsApp: FindAllProductsApplication,
  ) {}

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

  @Get('/')
  @ApiOperation({ summary: 'Listar todos os produtos (paginado)' })
  @ApiQuery({ type: ListProductsQueryDto })
  @ApiResponse({ status: 200, type: PaginatedProductsDto })
  @HttpCode(HttpStatus.OK)
  async findAllProducts(
    @Query() query: ListProductsQueryDto,
  ): Promise<PaginatedProductsDto> {
    return await this.findAllProductsApp.execute(query);
  }
}
