import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, DeleteDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TipoComida } from '../enums/tipo-comida.enum';

@Entity('registro_consumo')
export class RegistroConsumo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  usuario: User;

  @Column({ type: 'enum', enum: TipoComida })
  tipo_comida: TipoComida;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ type: 'varchar', length: 255 })
  foto: string; // Ruta local, ej: /uploads/consumo/mi-foto.jpg

  @CreateDateColumn()
  fecha: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
