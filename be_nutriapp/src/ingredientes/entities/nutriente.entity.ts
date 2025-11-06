import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  OneToMany,
  CreateDateColumn,
  DeleteDateColumn 
} from 'typeorm';
import { IngredienteNutriente } from './ingrediente-nutriente.entity';
import { Unit } from '../enums/unit.enum'; // <-- Ruta corregida

@Entity('nutrientes')
export class Nutriente {
  // ... (id, name, unit, ingredientes) ...
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({
    type: 'enum',
    enum: Unit,
  })
  unit: Unit;
  
  @OneToMany(
    () => IngredienteNutriente,
    (ingredienteNutriente) => ingredienteNutriente.nutriente
  )
  ingredientes: IngredienteNutriente[];

  @CreateDateColumn() // <-- AÑADIR (Para ordenar)
  createdAt: Date;

  @DeleteDateColumn() // <-- AÑADIR (Para Soft Delete)
  deletedAt: Date;
}