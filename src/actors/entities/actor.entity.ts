import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DATE_COLUMN_TYPE } from '../../common/database/column-types';
import { Media } from '../../media/entities/media.entity';

@Entity({ name: 'actors' })
export class Actor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 180 })
  name: string;

  @Column({ length: 200, unique: true })
  slug: string;

  @Column({ length: 30 })
  sector: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'logo_media_id', type: 'uuid', nullable: true })
  logoMediaId: string | null;

  @ManyToOne(() => Media, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'logo_media_id' })
  logoMedia: Media | null;

  @Column({ name: 'website_url', type: 'varchar', length: 300, nullable: true })
  websiteUrl: string | null;

  @Column({ name: 'contact_email', type: 'varchar', length: 180, nullable: true })
  contactEmail: string | null;

  @Column({ default: false })
  published: boolean;

  @Column({ default: false })
  consent: boolean;

  @Column({ name: 'consent_at', type: DATE_COLUMN_TYPE, nullable: true })
  consentAt: Date | null;

  @Column({ name: 'consent_note', type: 'text', nullable: true })
  consentNote: string | null;

  @Column({ default: 0 })
  order: number;

  @CreateDateColumn({ name: 'created_at', type: DATE_COLUMN_TYPE })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: DATE_COLUMN_TYPE })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: DATE_COLUMN_TYPE, nullable: true })
  deletedAt: Date | null;
}
