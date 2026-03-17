import { Injectable } from '@nestjs/common';
import { UpdateItemFulfillmentStatusUseCase } from '@core/orders/update-item-fulfillment-status/usecase';
import { FulfillmentStatus } from '@core/orders/entities/order.entity';

export interface UpdateItemFulfillmentStatusApplicationInput {
  orderId: string;
  orderItemId: string;
  fulfillmentStatus: FulfillmentStatus;
}

export interface UpdateItemFulfillmentStatusApplicationResult {
  message: string;
  orderItemId: string;
  fulfillmentStatus: FulfillmentStatus;
  productType: string;
}

@Injectable()
export class UpdateItemFulfillmentStatusApplication {
  constructor(private readonly useCase: UpdateItemFulfillmentStatusUseCase) {}

  async execute(
    input: UpdateItemFulfillmentStatusApplicationInput,
  ): Promise<UpdateItemFulfillmentStatusApplicationResult> {
    const result = await this.useCase.execute({
      orderId: input.orderId,
      orderItemId: input.orderItemId,
      fulfillmentStatus: input.fulfillmentStatus,
    });

    return {
      message: 'Status de fulfillment atualizado com sucesso',
      orderItemId: input.orderItemId,
      fulfillmentStatus: input.fulfillmentStatus,
      productType: result.productType,
    };
  }
}
