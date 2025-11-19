import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('medico_profiles')
export class MedicoProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  especialidad: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  numero_colegiado: string;

  @Column({ type: 'text', nullable: true })
  biografia: string;

  @OneToOne(() => User, user => user.medicoProfile)
  @JoinColumn()
  user: User;

  @OneToMany(() => User, user => user.medicoAsignado)
  pacientes: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
