import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { Nino } from '../../ninos/entities/nino.entity';
import { Dish } from '../../dish/entities/dish.entity';

@Entity({ name: 'meal_logs' })
export class MealLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @Column({ type: 'int' })
  grams_served: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  iron_consumed_mg: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  calories_consumed: number;

  @ManyToOne(() => Nino, { eager: true })
  patient: Nino;

  @ManyToOne(() => Dish, { eager: true })
  dish: Dish;

  @CreateDateColumn()
  created_at: Date;
}
