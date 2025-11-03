import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity({ name: 'ninos' })
export class Nino {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  fecha_nacimiento: Date;

  @Column({ type: 'int' })
  birthYear: number; // Año de nacimiento

  @Column({ type: 'enum', enum: ['masculino', 'femenino'] })
  genero: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  peso_actual: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  altura_actual: number;

  @ManyToOne(() => User, { eager: false })
  madre: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Método para calcular la edad en meses dinámicamente
  getAgeInMonths(): number {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    const ageInYears = currentYear - this.birthYear;
    const ageInMonths = ageInYears * 12 + currentMonth;
    
    return Math.max(0, ageInMonths); // Evitar valores negativos
  }
}
