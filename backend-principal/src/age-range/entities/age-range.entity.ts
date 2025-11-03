import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { DailyRequirement } from '../../daily-requirement/entities/daily-requirement.entity';
import { PlateType } from '../../plate-type/entities/plate-type.entity';

@Entity({ name: 'age_ranges' })
export class AgeRange {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column({ type: 'int' })
  min_months: number;

  @Column({ type: 'int' })
  max_months: number;

  @OneToMany(() => DailyRequirement, dailyRequirement => dailyRequirement.ageRange)
  dailyRequirements: DailyRequirement[];

  @OneToMany(() => PlateType, plateType => plateType.ageRange)
  plateTypes: PlateType[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
