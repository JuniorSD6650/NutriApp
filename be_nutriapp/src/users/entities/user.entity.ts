// src/users/entities/user.entity.ts

import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  OneToMany  
} from 'typeorm';
import { Role } from '../enums/role.enum'; 

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
  
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}