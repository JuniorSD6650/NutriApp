// src/ingredientes/entities/ingrediente-nutriente.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Ingrediente } from './ingrediente.entity';
import { Nutriente } from './nutriente.entity';

@Entity('ingrediente_nutrientes')
export class IngredienteNutriente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value_per_100g: number;

  @ManyToOne(
    () => Ingrediente,
    (ingrediente) => ingrediente.nutrientes,
    { onDelete: 'CASCADE' }
  )
  ingrediente: Ingrediente;

  @ManyToOne(
    () => Nutriente,
    (nutriente) => nutriente.ingredientes,
    { onDelete: 'CASCADE', eager: true } // <-- AÑADIR eager: true
  )
  nutriente: Nutriente;
}