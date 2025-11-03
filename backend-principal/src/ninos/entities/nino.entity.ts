import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity({ name: 'ninos' })
export class Nino {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column({ type: 'date' })
  fecha_nacimiento: Date;

  @Column({ type: 'enum', enum: ['masculino', 'femenino'] })
  genero: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  peso_actual: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  altura_actual: number;

  @ManyToOne(() => User, { eager: true })
  madre: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
