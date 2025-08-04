import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { Order } from './order.entity';
import { Product } from './products.entity';
import { OrderItemDetail } from './order-item-detail.entity';

export type ProductType = 'GENERIC' | 'DIGITAL_FILES' | 'ALBUM';

@Entity({ name: 'order_items' })
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string = randomUUID();

  @Column({ type: 'uuid' })
  @Index('idx_order_item_order_id')
  orderId!: string;

  @ManyToOne(() => Order, (order) => order.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orderId' })
  order!: Order;

  @Column({ type: 'uuid' })
  @Index('idx_order_item_product_id')
  productId!: string;

  @ManyToOne(() => Product, {
    nullable: false,
  })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @Column({ type: 'varchar', length: 255 })
  productName!: string;

  @Column({
    type: 'enum',
    enum: ['GENERIC', 'DIGITAL_FILES', 'ALBUM'],
  })
  productType!: ProductType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  itemPrice!: number;

  @OneToMany(() => OrderItemDetail, (detail) => detail.orderItem, {
    cascade: true,
    eager: false,
  })
  details!: OrderItemDetail[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;
}
