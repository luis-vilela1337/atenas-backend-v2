import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InstitutionEvent } from './instituition.events';
import { User } from './user.entity';
import { InstitutionProduct } from '@infrastructure/data/sql/entities/institution-products.entity';

@Entity({ name: 'institutions' })
export class Institution {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  contractNumber!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  observations?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt?: Date;

  @OneToMany(() => User, (user) => user.institution, {
    cascade: ['insert', 'update', 'remove'],
    lazy: false,
  })
  users!: User[];

  @OneToMany(() => InstitutionEvent, (event) => event.institution, {
    cascade: ['insert', 'update', 'remove'],
    lazy: false,
  })
  events: InstitutionEvent[];

  @OneToMany(() => InstitutionProduct, (ip) => ip.institution, {
    cascade: ['remove'],
    lazy: false,
  })
  institutionProducts: InstitutionProduct[];
}
