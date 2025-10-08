import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { User } from './user.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '@core/orders/entities/order.entity';

export type PaymentStatus = OrderStatus;

export interface ShippingAddress {
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string = randomUUID();

  @Column({
    type: 'integer',
    unique: true,
    name: 'display_id',
    generated: 'increment',
    nullable: true,
  })
  displayId: number;

  @Column({ type: 'uuid' })
  @Index('idx_order_user_id')
  userId!: string;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  @Index('idx_order_payment_status')
  paymentStatus!: PaymentStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index('idx_order_payment_gateway_id')
  paymentGatewayId?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  contractNumber?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  contractUniqueId?: string;

  @Column({ type: 'jsonb', nullable: true })
  shippingAddress?: ShippingAddress;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
    eager: false,
  })
  items!: OrderItem[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  creditUsed?: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  updatedAt?: Date;
}
