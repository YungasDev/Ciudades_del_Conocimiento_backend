import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'contact_messages' })
export class ContactMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  @Column({ length: 180 })
  email: string;

  @Column({ type: 'varchar', length: 180, nullable: true })
  organization: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  sector: string | null;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: false })
  consent: boolean;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
