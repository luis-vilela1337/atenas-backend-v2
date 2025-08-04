import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type NotificationStatus = 'pending' | 'processed' | 'failed';
export type NotificationType = 'payment' | 'merchant_order';

@Entity({ name: 'mercado_pago_notifications' })
export class MercadoPagoNotification {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  @Index('idx_notification_type')
  type!: NotificationType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index('idx_payment_id')
  paymentId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index('idx_merchant_order_id')
  merchantOrderId?: string;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  @Index('idx_notification_status')
  status!: NotificationStatus;

  @Column({ type: 'jsonb' })
  rawData!: any;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  @Index('idx_created_at')
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'processed_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  processedAt?: Date;
}