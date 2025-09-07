// src/infrastructure/data/sql/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { Institution } from './instituition.entity';

export type UserRole = 'admin' | 'client';
export type UserStatus = 'active' | 'inactive';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string = randomUUID();

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 50 })
  identifier!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 20 })
  phone!: string;

  @Column({ type: 'text', nullable: true })
  observations?: string;

  @Column({ type: 'varchar' })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 20 })
  role!: UserRole;

  @ManyToOne(() => Institution, (inst) => inst.users, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'institution_id' })
  institution!: Institution;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fatherName?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  fatherPhone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  motherName?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  motherPhone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  driveLink?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  creditValue?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profileImage?: string;

  @Column({ type: 'varchar', length: 20 })
  status!: UserStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  currentHashedRefreshToken?: string;

  @Column({ type: 'varchar', length: 14, nullable: true })
  cpf?: string;

  @Column({ type: 'text', nullable: true })
  becaMeasures?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 9, nullable: true })
  zipCode?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  updatedAt?: Date;
}
