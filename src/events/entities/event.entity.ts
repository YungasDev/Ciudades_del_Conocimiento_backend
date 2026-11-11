import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'events' })
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ length: 220, unique: true })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'starts_at', type: 'datetime' })
  startsAt: Date;

  @Column({ name: 'ends_at', type: 'datetime', nullable: true })
  endsAt: Date | null;

  @Column({ length: 200 })
  place: string;

  @Column({ name: 'cta_label', type: 'varchar', length: 100, nullable: true })
  ctaLabel: string | null;

  @Column({ name: 'cta_url', type: 'varchar', length: 300, nullable: true })
  ctaUrl: string | null;

  @Column({ default: true })
  published: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
