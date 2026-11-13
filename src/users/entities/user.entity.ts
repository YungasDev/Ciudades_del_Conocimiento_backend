import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DATE_COLUMN_TYPE } from '../../common/database/column-types';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  @Column({ length: 180, unique: true })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ length: 20, default: 'EDITOR' })
  role: string;

  @Column({ default: true })
  active: boolean;

  @Column({ name: 'must_change_password', default: false })
  mustChangePassword: boolean;

  @CreateDateColumn({ name: 'created_at', type: DATE_COLUMN_TYPE })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: DATE_COLUMN_TYPE })
  updatedAt: Date;
}
