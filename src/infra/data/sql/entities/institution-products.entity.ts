import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Institution } from './instituition.entity';
import { Product } from './products.entity';
import { ProductFlag } from '../types/product-flag.enum';

export interface AlbumDetails {
  minPhoto: number;
  maxPhoto: number;
  valorEncadernacao: number;
  valorFoto: number;
}
export interface EventConfiguration {
  id: string;
  minPhotos?: number;
  valorPhoto?: number;
  valorPack?: number;
}

export interface GenericDetails {
  isAvailableUnit?: boolean;
  events: EventConfiguration[];
}

export interface DigitalFilesDetails {
  isAvailableUnit: boolean;
  events?: EventConfiguration[];
  minPhotos?: number;
  valorPackTotal?: number;
  eventId?: string;
}

export type ProductDetails =
  | AlbumDetails
  | GenericDetails
  | DigitalFilesDetails;

@Entity({ name: 'institution_products' })
@Unique('unique_product_institution', ['product', 'institution'])
@Index('idx_institution_product_flag', ['flag'])
@Index('idx_institution_product_created', ['createdAt'])
export class InstitutionProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  @Index('idx_institution_product_product_id')
  product: Product;

  @ManyToOne(() => Institution, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'institution_id' })
  @Index('idx_institution_product_institution_id')
  institution: Institution;

  @Column({
    type: 'enum',
    enum: ProductFlag,
    nullable: false,
  })
  flag: ProductFlag;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  details: ProductDetails | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    nullable: true,
  })
  updatedAt?: Date;
}
