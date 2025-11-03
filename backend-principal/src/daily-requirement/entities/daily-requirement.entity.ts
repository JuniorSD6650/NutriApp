import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { AgeRange } from '../../age-range/entities/age-range.entity';

@Entity({ name: 'daily_requirements' })
export class DailyRequirement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nutrient: string;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  min_value_mg: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  max_value_mg: number;

  @ManyToOne(() => AgeRange, ageRange => ageRange.dailyRequirements)
  ageRange: AgeRange;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
