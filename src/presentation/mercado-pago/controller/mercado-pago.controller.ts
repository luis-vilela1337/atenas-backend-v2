import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePreferenceApplication } from '@application/mercado-pago/create-preference.application';
import {
  CreatePreferenceInputDto,
  CreatePreferenceResponseDto,
} from '../dto/create-preference.dto';
import { CreatePreferenceAdapter } from '@application/mercado-pago/adapters/create-preference.adapter';

@ApiTags('mercado-pago')
@Controller('v1/mercado-pago')
export class MercadoPagoController {
  constructor(
    private readonly createPreferenceApp: CreatePreferenceApplication,
  ) {}

  @Post('/create-preference')
  @ApiOperation({ summary: 'Criar preferência de pagamento no Mercado Pago' })
  @ApiBody({ type: CreatePreferenceInputDto })
  @ApiResponse({
    status: 200,
    type: CreatePreferenceResponseDto,
    description: 'Preferência criada com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou erro na criação da preferência',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  @HttpCode(HttpStatus.OK)
  async createPreference(
    @Body() dto: CreatePreferenceInputDto,
  ): Promise<CreatePreferenceResponseDto> {
    const preference = CreatePreferenceAdapter.toEntity(dto);
    const result = await this.createPreferenceApp.execute(preference);
    return CreatePreferenceAdapter.toResponseDto(result);
  }
}
