import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { UpdateInstituitionDto } from '../dto/update.instituition';
import { CreateInstituitionDto } from '../dto/create.instituition';
import {
  ListInstituitionQueryDto,
  ListInstitutionsResponseDto,
} from '../dto/find-all.intituition';
import { InstitutionResponseDto } from '../dto/find-by-id.insituition';
import { FindAllInstitutionApplication } from '@application/insitutiotion/find-all';
import { FindByIdInstitutionApplication } from '@application/insitutiotion/find-by-id';
import { UpdateInstitutionApplication } from '@application/insitutiotion/update';
import { DeleteInstitutionApplication } from '@application/insitutiotion/delete';
import { CreateInstitutionApplication } from '@application/insitutiotion/create';

@ApiTags('institutions')
@Controller('v2/institutions')
export class InstitutionController {
  constructor(
    private readonly findAllInstitutionApp: FindAllInstitutionApplication,
    private readonly createInstitutionApp: CreateInstitutionApplication,
    private readonly findByIdInstitutionApp: FindByIdInstitutionApplication,
    private readonly updateInstitutionApp: UpdateInstitutionApplication,
    private readonly deleteInstitutionApp: DeleteInstitutionApplication,
  ) {}

  @Get('/')
  @ApiOperation({ summary: 'Listar todas as instituições (paginado)' })
  @ApiQuery({ type: ListInstituitionQueryDto })
  @ApiResponse({ status: 200, type: ListInstitutionsResponseDto })
  @HttpCode(HttpStatus.OK)
  async findAllInstituition(
    @Query() dto: ListInstituitionQueryDto,
  ): Promise<ListInstitutionsResponseDto> {
    return await this.findAllInstitutionApp.execute(dto);
  }

  @Post('/')
  @ApiOperation({ summary: 'Criar uma nova instituição' })
  @ApiBody({ type: CreateInstituitionDto })
  @ApiResponse({ status: 201, type: InstitutionResponseDto })
  @HttpCode(HttpStatus.CREATED)
  async createInstituition(
    @Body() dto: CreateInstituitionDto,
  ): Promise<InstitutionResponseDto> {
    return await this.createInstitutionApp.execute(dto);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Obter uma instituição pelo ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: InstitutionResponseDto })
  @HttpCode(HttpStatus.OK)
  async findByIdInstituition(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<InstitutionResponseDto> {
    return await this.findByIdInstitutionApp.execute(id);
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Atualizar uma instituição existente' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateInstituitionDto })
  @ApiResponse({ status: 200, type: InstitutionResponseDto })
  @HttpCode(HttpStatus.OK)
  async updateInstituition(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInstituitionDto,
  ): Promise<InstitutionResponseDto> {
    return await this.updateInstitutionApp.execute(id, dto);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Remover uma instituição' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    schema: {
      properties: { success: { type: 'boolean' }, message: { type: 'string' } },
    },
  })
  @HttpCode(HttpStatus.OK)
  async deleteInstituition(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean; message: string }> {
    return await this.deleteInstitutionApp.execute(id);
  }
}
