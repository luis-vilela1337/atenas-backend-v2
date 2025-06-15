import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateProductApplication } from '@application/products/create-product.application';
import { DeleteProductApplication } from '@application/products/delete-product.application';
import {
  CreateProductInputDto,
  CreateProductResponseDto,
} from '../dto/create-product.dto';
import { FindAllProductsApplication } from '@application/products/find-all-products.application';
import { ListProductsQueryDto } from '../dto/list-products-query.dto';
import { PaginatedProductsDto } from '../dto/paginated-products.dto';
import { FindProductByIdApplication } from '@application/products/find-by-id-products.application';
import { ProductDto } from '../dto/product.dto';
import { FindProductByIdParamDto } from '../dto/find-by-id-products.dto';
import { DeleteProductParamDto } from '../dto/delete-product.dto';

@ApiTags('products')
@Controller('v2/products')
export class ProductsController {
  constructor(
    private readonly createProductApp: CreateProductApplication,
    private readonly findAllProductsApp: FindAllProductsApplication,
    private readonly findProductByIdApp: FindProductByIdApplication,
    private readonly deleteProductApp: DeleteProductApplication,
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

  @Get('/:id')
  @ApiOperation({ summary: 'Obter produto por ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'ID do produto',
  })
  @ApiResponse({
    status: 200,
    type: ProductDto,
    description: 'Produto encontrado',
  })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  @HttpCode(HttpStatus.OK)
  async findProductById(
    @Param() params: FindProductByIdParamDto,
  ): Promise<ProductDto> {
    return await this.findProductByIdApp.execute(params.id);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Deletar produto por ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'ID do produto a ser deletado',
  })
  @ApiResponse({
    status: 204,
    description: 'Produto deletado com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProduct(@Param() params: DeleteProductParamDto): Promise<void> {
    return await this.deleteProductApp.execute(params.id);
  }
}
