import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { Nino } from '../../ninos/entities/nino.entity';

@Entity({ name: 'registros_tamizaje' })
export class RegistroTamizaje {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url_foto: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  resultado_hemoglobina: number;

  @Column({ type: 'varchar', length: 50 })
  interpretacion: string; // 'normal', 'leve', 'moderada', 'severa'

  @ManyToOne(() => Nino, { eager: true })
  nino: Nino;

  @CreateDateColumn()
  created_at: Date;
}
