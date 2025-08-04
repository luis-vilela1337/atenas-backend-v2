import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export type PaymentStatusType =
  | 'pending'
  | 'approved'
  | 'authorized'
  | 'in_process'
  | 'in_mediation'
  | 'rejected'
  | 'cancelled'
  | 'refunded'
  | 'charged_back';

@Entity({ name: 'payment_status_history' })
export class PaymentStatusHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  @Index('idx_payment_history_payment_id')
  paymentId!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index('idx_payment_history_external_reference')
  externalReference?: string;

  @Column({ type: 'varchar', length: 50 })
  @Index('idx_payment_history_status')
  status!: PaymentStatusType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  statusDetail?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  transactionAmount?: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  dateApproved?: Date;

  @Column({ type: 'timestamp with time zone' })
  dateCreated!: Date;

  @Column({ type: 'timestamp with time zone' })
  lastModified!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;
}
