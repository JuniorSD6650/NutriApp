// src/ingredientes/entities/ingrediente.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  DeleteDateColumn
} from 'typeorm';
import { IngredienteNutriente } from './ingrediente-nutriente.entity';

@Entity('ingredientes')
export class Ingrediente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @OneToMany(
    () => IngredienteNutriente,
    (ingredienteNutriente) => ingredienteNutriente.ingrediente,
    { cascade: true, eager: true } // <-- AÑADIR eager: true
  )
  nutrientes: IngredienteNutriente[];

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}