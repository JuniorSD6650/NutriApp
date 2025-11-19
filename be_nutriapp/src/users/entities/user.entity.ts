import { RefreshToken } from '../../auth/entities/refresh-token.entity';
import { MetaDiaria } from '../../metas/entities/meta-diaria.entity';
// src/users/entities/user.entity.ts

import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn
} from 'typeorm';
import { Role } from '../enums/role.enum';
import { PacienteProfile } from './paciente-profile.entity';
import { MedicoProfile } from './medico-profile.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  googleId?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({
    type: 'enum', 
    enum: Role,
    default: Role.PACIENTE 
  })
  role: Role;

  @OneToOne(() => PacienteProfile, profile => profile.user, { cascade: true })
  pacienteProfile: PacienteProfile;

  @OneToOne(() => MedicoProfile, profile => profile.user, { cascade: true })
  medicoProfile: MedicoProfile;

  @ManyToOne(() => MedicoProfile, medico => medico.pacientes, { nullable: true })
  @JoinColumn({ name: 'medico_asignado_id' })
  medicoAsignado: MedicoProfile;
  
  @OneToMany(() => MetaDiaria, (meta) => meta.paciente)
  metas: MetaDiaria[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];
  
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  
  // Si usas soft delete en User, puedes agregar:
  // @DeleteDateColumn()
  // deletedAt: Date;
}