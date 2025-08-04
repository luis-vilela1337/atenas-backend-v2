import { Body, Controller, Post, HttpCode, HttpStatus, Headers, RawBodyRequest, Req } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePreferenceApplication } from '@application/mercado-pago/create-preference.application';
import { ProcessWebhookApplication } from '@application/mercado-pago/process-webhook.application';
import {
  CreatePreferenceInputDto,
  CreatePreferenceResponseDto,
} from '../dto/create-preference.dto';
import {
  MercadoPagoWebhookDto,
  WebhookResponseDto,
} from '../dto/webhook.dto';
import { CreatePreferenceAdapter } from '@application/mercado-pago/adapters/create-preference.adapter';
import { Request } from 'express';

@ApiTags('mercado-pago')
@Controller('v1/mercado-pago')
export class MercadoPagoController {
  constructor(
    private readonly createPreferenceApp: CreatePreferenceApplication,
    private readonly processWebhookApp: ProcessWebhookApplication,
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

  @Post('/webhook')
  @ApiOperation({ summary: 'Processar webhook do Mercado Pago' })
  @ApiBody({ type: MercadoPagoWebhookDto })
  @ApiResponse({
    status: 200,
    type: WebhookResponseDto,
    description: 'Webhook processado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou erro na validação',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  @HttpCode(HttpStatus.OK)
  async processWebhook(
    @Body() dto: MercadoPagoWebhookDto,
    @Headers() headers: Record<string, string>,
    @Req() req: RawBodyRequest<Request>,
  ): Promise<WebhookResponseDto> {
    try {
      const result = await this.processWebhookApp.execute({
        webhookData: dto,
        signature: headers['x-signature'] || '',
        requestBody: req.rawBody?.toString() || JSON.stringify(dto),
      });

      if (result.processed) {
        return {
          status: 'success',
          message: 'Webhook processed successfully',
        };
      } else {
        return {
          status: 'error',
          message: 'Failed to process webhook',
          error: result.error,
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'Error processing webhook',
        error: error.message,
      };
    }
  }
}
