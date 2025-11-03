import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'ingredients' })
export class Ingredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  iron_mg_per_100g: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  calories_per_100g: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  protein_g_per_100g: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  carbs_g_per_100g: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
