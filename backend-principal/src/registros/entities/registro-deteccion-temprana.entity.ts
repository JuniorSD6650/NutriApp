import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Nino } from '../../ninos/entities/nino.entity';

@Entity('registros_deteccion_temprana')
export class RegistroDeteccionTemprana {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url_foto: string;

  @Column()
  fecha: Date;

  @Column('decimal', { precision: 5, scale: 2 })
  confianza_ia: number; // Porcentaje de confianza de la IA (0-100)

  @Column({
    type: 'enum',
    enum: ['normal', 'sospechoso', 'probable_anemia'],
    default: 'normal'
  })
  resultado_ia: string;

  @Column('json', { nullable: true })
  parametros_detectados: object; // Datos técnicos de la IA (color, textura, etc.)

  @Column({
    type: 'enum',
    enum: ['baja', 'media', 'alta'],
    default: 'baja'
  })
  nivel_alerta: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @ManyToOne(() => Nino, nino => nino.id, { onDelete: 'CASCADE' })
  nino: Nino;

  @CreateDateColumn()
  created_at: Date;
}
