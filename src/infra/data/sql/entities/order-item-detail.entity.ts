import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { OrderItem } from './order-item.entity';
import { UserEventPhoto } from './user-event-photo.entity';

@Entity({ name: 'order_item_details' })
export class OrderItemDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string = randomUUID();

  @Column({ type: 'uuid' })
  @Index('idx_order_item_detail_order_item_id')
  orderItemId!: string;

  @ManyToOne(() => OrderItem, (orderItem) => orderItem.details, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orderItemId' })
  orderItem!: OrderItem;

  @Column({ type: 'uuid', nullable: true })
  @Index('idx_order_item_detail_photo_id')
  photoId?: string;

  @ManyToOne(() => UserEventPhoto, {
    nullable: true,
  })
  @JoinColumn({ name: 'photoId' })
  photo?: UserEventPhoto;

  @Column({ type: 'uuid', nullable: true })
  @Index('idx_order_item_detail_event_id')
  eventId?: string;

  @Column({ type: 'boolean', default: false })
  isPackage!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;
}
