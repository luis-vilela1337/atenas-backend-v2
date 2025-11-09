import { Injectable, Logger } from '@nestjs/common';
import { UpdateOrderStatusUseCase } from '@core/orders/update-order-status/usecase';
import { OrderStatus } from '@core/orders/entities/order.entity';
import { OrderRepository } from '@infrastructure/data/sql/repositories/order.repository';
import { UserSQLRepository } from '@infrastructure/data/sql/repositories/user.repository';
import { MailerSendService } from '@infrastructure/services/mailersend.service';

export interface UpdateOrderStatusApplicationInput {
  orderId: string;
  status: OrderStatus;
  driveLink?: string;
}

export interface UpdateOrderStatusApplicationResult {
  message: string;
  orderId: string;
  status: OrderStatus;
}

@Injectable()
export class UpdateOrderStatusApplication {
  private readonly logger = new Logger(UpdateOrderStatusApplication.name);

  constructor(
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
    private readonly orderRepository: OrderRepository,
    private readonly userRepository: UserSQLRepository,
    private readonly mailerSendService: MailerSendService,
  ) {}

  async execute(
    input: UpdateOrderStatusApplicationInput,
  ): Promise<UpdateOrderStatusApplicationResult> {
    await this.updateOrderStatusUseCase.execute({
      orderId: input.orderId,
      paymentStatus: input.status,
      driveLink: input.driveLink,
    });

    if (input.status === OrderStatus.COMPLETED) {
      await this.sendCompletionEmails(input.orderId, input.driveLink);
    }

    return {
      message: 'Status do pedido atualizado com sucesso',
      orderId: input.orderId,
      status: input.status,
    };
  }

  private async sendCompletionEmails(
    orderId: string,
    driveLink?: string,
  ): Promise<void> {
    try {
      // Fetch order with items
      const order = await this.orderRepository.findOrderById(orderId);
      if (!order) {
        this.logger.error(`Order not found: ${orderId}`);
        return;
      }

      // Fetch user details
      const user = await this.userRepository.findById(order.userId);
      if (!user) {
        this.logger.error(`User not found for order: ${orderId}`);
        return;
      }

      // Check product types in order items
      const hasDigitalFiles = order.items.some(
        (item) => item.productType === 'DIGITAL_FILES',
      );
      const hasPhysicalProducts = order.items.some(
        (item) =>
          item.productType === 'ALBUM' || item.productType === 'GENERIC',
      );

      // Send email for digital files
      if (hasDigitalFiles) {
        if (!driveLink) {
          this.logger.warn(
            `Order ${orderId} contains digital files but no drive link was provided`,
          );
        } else {
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
            `Digital files completion email sent for order ${orderId} to ${user.email}`,
          );
        }
      }

      // Send email for physical products
      if (hasPhysicalProducts) {
        const shippingAddress =
          order.shippingAddress ||
          (user.zipCode && user.street && user.number && user.city && user.state
            ? {
                zipCode: user.zipCode,
                street: user.street,
                number: user.number,
                complement: user.complement,
                neighborhood: user.neighborhood || '',
                city: user.city,
                state: user.state,
              }
            : null);

        if (!shippingAddress) {
          this.logger.warn(
            `Order ${orderId} contains physical products but no shipping address is available`,
          );
        } else {
          await this.mailerSendService.sendPhysicalOrderCompletedEmail(
            {
              email: user.email,
              name: user.name,
            },
            {
              orderId: order.id,
              displayId: order.displayId?.toString(),
              shippingAddress,
            },
          );
          this.logger.log(
            `Physical order completion email sent for order ${orderId} to ${user.email}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to send completion emails for order ${orderId}: ${error.message}`,
        error.stack,
      );
      // Don't throw - we don't want to fail the order update if email fails
    }
  }
}
