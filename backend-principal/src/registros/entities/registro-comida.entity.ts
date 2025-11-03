import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { Nino } from '../../ninos/entities/nino.entity';

export interface NutrientesJson {
  proteinas: number;
  carbohidratos: number;
  grasas: number;
  fibra: number;
  vitamina_c: number;
  calcio: number;
}

@Entity({ name: 'registros_comida' })
export class RegistroComida {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url_foto: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  hierro_mg: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  calorias: number;

  @Column({ type: 'json' })
  json_nutrientes: NutrientesJson;

  @ManyToOne(() => Nino, { eager: true })
  nino: Nino;

  @CreateDateColumn()
  created_at: Date;
}
