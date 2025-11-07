import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { User } from './user.entity';

export enum TipoDieta {
  OMNIVORA = 'OMNIVORA',
  VEGETARIANA = 'VEGETARIANA',
  VEGANA = 'VEGANA',
}

@Entity('paciente_profiles')
export class PacienteProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  fecha_nacimiento: Date;

  @Column({ type: 'float' })
  peso_inicial_kg: number;

  @Column({ type: 'float' })
  altura_cm: number;

  @Column({ type: 'date', nullable: true })
  fecha_probable_parto?: Date;

  @Column({ type: 'int', nullable: true })
  semanas_gestacion?: number;

  @Column({ type: 'enum', enum: TipoDieta, nullable: true })
  tipo_dieta?: TipoDieta;

  @Column({ type: 'varchar', nullable: true })
  alergias_alimentarias?: string;

  @Column({ type: 'boolean', default: false })
  toma_suplementos_hierro: boolean;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
