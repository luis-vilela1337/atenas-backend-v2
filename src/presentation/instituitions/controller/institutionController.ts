import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateInstituitionDto } from '../dto/update.instituition';
import { CreateInstituitionDto } from '../dto/create.instituition';
import {
  ListInstituitionQueryDto,
  ListInstitutionsResponseDto,
} from '../dto/find-all.intituition';
import { InstitutionResponseDto } from '../dto/find-by-id.insituition';
import { SendCredentialsResponseDto } from '../dto/send-credentials.dto';
import { DeleteEventParamDto } from '../dto/delete-event.dto';
import { FindAllInstitutionApplication } from '@application/insitutiotion/find-all';
import { FindByIdInstitutionApplication } from '@application/insitutiotion/find-by-id';
import { UpdateInstitutionApplication } from '@application/insitutiotion/update';
import { DeleteInstitutionApplication } from '@application/insitutiotion/delete';
import { DeleteEventApplication } from '@application/insitutiotion/delete-event';
import { CreateInstitutionApplication } from '@application/insitutiotion/create';
import { SendStudentCredentialsApplication } from '@application/insitutiotion/send-student-credentials';
import { AdminGuard } from '@presentation/auth/guards/admin.guard';

@ApiTags('institutions')
@Controller('v1/institutions')
export class InstitutionController {
  constructor(
    private readonly findAllInstitutionApp: FindAllInstitutionApplication,
    private readonly createInstitutionApp: CreateInstitutionApplication,
    private readonly findByIdInstitutionApp: FindByIdInstitutionApplication,
    private readonly updateInstitutionApp: UpdateInstitutionApplication,
    private readonly deleteInstitutionApp: DeleteInstitutionApplication,
    private readonly deleteEventApp: DeleteEventApplication,
    private readonly sendStudentCredentialsApp: SendStudentCredentialsApplication,
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

  @Delete('/events/:eventId')
  @ApiOperation({ summary: 'Excluir um evento' })
  @ApiParam({ name: 'eventId', format: 'uuid', description: 'ID do evento' })
  @ApiResponse({
    status: 200,
    schema: {
      properties: { success: { type: 'boolean' }, message: { type: 'string' } },
    },
  })
  @HttpCode(HttpStatus.OK)
  async deleteEvent(
    @Param() params: DeleteEventParamDto,
  ): Promise<{ success: boolean; message: string }> {
    return await this.deleteEventApp.execute(params.eventId);
  }

  @Post('/:id/send-credentials')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Enviar credenciais para todos os alunos da instituição',
    description:
      'Envia email com credenciais de acesso para alunos que nunca fizeram login ' +
      'e código de reset de senha para alunos que já acessaram a plataforma.',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'ID da instituição' })
  @ApiResponse({
    status: 200,
    type: SendCredentialsResponseDto,
    description: 'Credenciais enviadas com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Instituição não encontrada' })
  @HttpCode(HttpStatus.OK)
  async sendStudentCredentials(
    @Param('id', ParseUUIDPipe) institutionId: string,
    @Request() req,
  ): Promise<SendCredentialsResponseDto> {
    const result = await this.sendStudentCredentialsApp.execute({
      institutionId,
      adminUserId: req.user.userId,
    });
    return SendCredentialsResponseDto.adapterToResponse(result);
  }
}
