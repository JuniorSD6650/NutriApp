import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, DeleteDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Platillo } from '../../platillos/entities/platillo.entity';
import { TipoComida } from '../enums/tipo-comida.enum';

@Entity('registro_consumo')
export class RegistroConsumo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  usuario: User;

  @ManyToOne(() => Platillo, { eager: true, onDelete: 'SET NULL', nullable: true })
  platillo: Platillo; // <-- CAMBIO CLAVE: ahora referencia al platillo

  @Column({ type: 'enum', enum: TipoComida })
  tipo_comida: TipoComida;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1 })
  porciones: number; // <-- NUEVO: cuántas porciones comió (ej. 1.5)

  @Column({ type: 'text', nullable: true })
  descripcion?: string; // <-- Para el modo "Describir" (speech-to-text)

  @Column({ type: 'varchar', length: 255, nullable: true })
  foto?: string; // <-- AHORA ES OPCIONAL (para el modo "Foto")

  @CreateDateColumn()
  fecha: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
