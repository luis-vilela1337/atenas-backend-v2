import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { UpdateItemFulfillmentStatusUseCase } from '@core/orders/update-item-fulfillment-status/usecase';
import { FulfillmentStatus } from '@core/orders/entities/order.entity';
import { OrderRepository } from '@infrastructure/data/sql/repositories/order.repository';
import { UserSQLRepository } from '@infrastructure/data/sql/repositories/user.repository';
import { MailerSendService } from '@infrastructure/services/mailersend.service';

export interface UpdateItemFulfillmentStatusApplicationInput {
  orderId: string;
  orderItemId: string;
  fulfillmentStatus: FulfillmentStatus;
  driveLink?: string;
}

export interface UpdateItemFulfillmentStatusApplicationResult {
  message: string;
  orderItemId: string;
  fulfillmentStatus: FulfillmentStatus;
  productType: string;
  finalizadoEm?: Date;
}

@Injectable()
export class UpdateItemFulfillmentStatusApplication {
  private readonly logger = new Logger(
    UpdateItemFulfillmentStatusApplication.name,
  );

  constructor(
    private readonly useCase: UpdateItemFulfillmentStatusUseCase,
    private readonly orderRepository: OrderRepository,
    private readonly userRepository: UserSQLRepository,
    private readonly mailerSendService: MailerSendService,
  ) {}

  async execute(
    input: UpdateItemFulfillmentStatusApplicationInput,
  ): Promise<UpdateItemFulfillmentStatusApplicationResult> {
    const order = await this.orderRepository.findOrderById(input.orderId);
    if (!order) {
      throw new Error(`Order with ID ${input.orderId} not found`);
    }

    const item = order.items.find((i) => i.id === input.orderItemId);
    if (!item) {
      throw new Error(
        `Item ${input.orderItemId} not found in order ${input.orderId}`,
      );
    }

    if (
      item.productType === 'DIGITAL_FILES' &&
      input.fulfillmentStatus === FulfillmentStatus.SENT
    ) {
      if (!input.driveLink) {
        throw new BadRequestException(
          'Drive link is required when completing a digital files item',
        );
      }
    }

    const result = await this.useCase.execute({
      orderId: input.orderId,
      orderItemId: input.orderItemId,
      fulfillmentStatus: input.fulfillmentStatus,
    });

    if (
      item.productType === 'DIGITAL_FILES' &&
      input.fulfillmentStatus === FulfillmentStatus.SENT &&
      input.driveLink
    ) {
      await this.sendDigitalFilesEmail(order, input.driveLink);
    }

    return {
      message: 'Status de fulfillment atualizado com sucesso',
      orderItemId: input.orderItemId,
      fulfillmentStatus: input.fulfillmentStatus,
      productType: result.productType,
      finalizadoEm: result.finalizadoEm,
    };
  }

  private async sendDigitalFilesEmail(
    order: any,
    driveLink: string,
  ): Promise<void> {
    try {
      const user = await this.userRepository.findById(order.userId);
      if (!user) {
        this.logger.error(`User not found for order: ${order.id}`);
        return;
      }

      await this.mailerSendService.sendDigitalFilesCompletedEmail(
        {
          email: user.email,
          name: user.name,
        },
        {
          orderId: order.id,
          displayId: order.displayId?.toString(),
        },
        driveLink,
      );
      this.logger.log(
        `Digital files completion email sent for order ${order.id} to ${user.email}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send completion emails for order ${order.id}: ${error.message}`,
        error.stack,
      );
    }
  }
}
