import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateInstitutionProductInputDto,
  CreateInstitutionProductResponseDto,
} from '@presentation/institution-product/dto/create.dto';
import { CreateInstitutionProductApplication } from '@application/institution-products/create';
import { InstitutionProductDto } from '@presentation/institution-product/dto/dto';
import { FindInstitutionProductByIdParamDto } from '@presentation/institution-product/dto/list-by-id.dto';
import { FindInstitutionProductByIdApplication } from '@application/institution-products/find-by-id';

@ApiTags('institution-products')
@Controller('v2/institution-products')
export class InstitutionProductsController {
  constructor(
    private readonly createInstitutionProductApp: CreateInstitutionProductApplication,
    private readonly findInstitutionProductByIdApp: FindInstitutionProductByIdApplication,
  ) {}

  @Post('/')
  @ApiOperation({ summary: 'Criar uma nova relação produto-instituição' })
  @ApiBody({ type: CreateInstitutionProductInputDto })
  @ApiResponse({ status: 201, type: CreateInstitutionProductResponseDto })
  @HttpCode(HttpStatus.CREATED)
  async createInstitutionProduct(
    @Body() dto: CreateInstitutionProductInputDto,
  ): Promise<CreateInstitutionProductResponseDto> {
    return await this.createInstitutionProductApp.execute(dto);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Obter relação produto-instituição por ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'ID da relação produto-instituição',
  })
  @ApiResponse({
    status: 200,
    type: InstitutionProductDto,
    description: 'Relação encontrada',
  })
  @ApiResponse({ status: 404, description: 'Relação não encontrada' })
  @HttpCode(HttpStatus.OK)
  async findInstitutionProductById(
    @Param() params: FindInstitutionProductByIdParamDto,
  ): Promise<InstitutionProductDto> {
    return await this.findInstitutionProductByIdApp.execute(params.id);
  }
}
