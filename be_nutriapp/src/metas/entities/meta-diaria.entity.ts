import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('metas_diarias')
export class MetaDiaria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  fecha: string;



  @Column({ type: 'float' })
  hierroObjetivo: number;

  @Column({ type: 'float', default: 0 })
  hierroConsumido: number;

  @Column({ type: 'boolean', default: false })
  completada: boolean;

  @ManyToOne(() => User, (user) => user.metas, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'paciente_id' })
  paciente: User;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'medico_id' })
  medico: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
