import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'localities' })
export class Locality {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  @Column({ length: 120 })
  province: string;

  @Column({ length: 120 })
  country: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
