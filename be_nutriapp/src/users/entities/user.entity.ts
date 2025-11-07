// src/users/entities/user.entity.ts

import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne
} from 'typeorm';
import { Role } from '../enums/role.enum';
import { PacienteProfile } from './paciente-profile.entity';
import { MedicoProfile } from './medico-profile.entity';

@Entity('users')
export class User {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password?: string;

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


  @ManyToOne(
    () => User,      
    (medico) => medico.pacientes,
    { nullable: true }
  )
  medico: User;

  @OneToMany(
    () => User,    
    (paciente) => paciente.medico 
  )
  pacientes: User[];
  
  @OneToOne(() => PacienteProfile, (profile) => profile.user, { nullable: true })
  pacienteProfile?: PacienteProfile;

  @OneToOne(() => MedicoProfile, (profile) => profile.user, { nullable: true })
  medicoProfile?: MedicoProfile;
  
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  
  // Si usas soft delete en User, puedes agregar:
  // @DeleteDateColumn()
  // deletedAt: Date;
}