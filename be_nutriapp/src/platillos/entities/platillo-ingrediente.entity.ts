import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Platillo } from './platillo.entity';
import { Ingrediente } from '../../ingredientes/entities/ingrediente.entity';

@Entity('platillo_ingredientes')
export class PlatilloIngrediente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Platillo, (platillo) => platillo.ingredientes, { onDelete: 'CASCADE' })
  platillo: Platillo;

  @ManyToOne(() => Ingrediente, { eager: true, onDelete: 'CASCADE' })
  ingrediente: Ingrediente;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cantidad: number; // gramos

  @Column({ type: 'varchar', length: 20, default: 'g' })
  unidad: string;
}
