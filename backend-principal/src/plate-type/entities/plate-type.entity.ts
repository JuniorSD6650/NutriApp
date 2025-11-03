import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { AgeRange } from '../../age-range/entities/age-range.entity';

@Entity({ name: 'plate_types' })
export class PlateType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column({ type: 'int' })
  serving_size_g: number;

  @ManyToOne(() => AgeRange, ageRange => ageRange.plateTypes)
  ageRange: AgeRange;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
