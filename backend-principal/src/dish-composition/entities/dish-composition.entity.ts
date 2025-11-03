import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Dish } from '../../dish/entities/dish.entity';
import { Ingredient } from '../../ingredient/entities/ingredient.entity';

@Entity({ name: 'dish_compositions' })
export class DishComposition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  grams: number;

  @ManyToOne(() => Dish, dish => dish.compositions)
  dish: Dish;

  @ManyToOne(() => Ingredient, { eager: true })
  ingredient: Ingredient;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
