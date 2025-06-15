import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Institution } from './instituition.entity';

@Entity({ name: 'institution_events' })
export class InstitutionEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Institution, (institution) => institution.events, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'institution_id' })
  institution: Institution;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt?: Date;
}
