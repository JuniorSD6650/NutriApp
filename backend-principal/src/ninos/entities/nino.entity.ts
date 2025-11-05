import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { RegistroDeteccionTemprana } from '../../registros/entities/registro-deteccion-temprana.entity';
import { MealLog } from '../../meal-log/entities/meal-log.entity';

@Entity('ninos')
export class Nino {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  fecha_nacimiento: Date;

  @Column({
    type: 'enum',
    enum: ['masculino', 'femenino'],
  })
  genero: string;

  @Column('decimal', { precision: 5, scale: 2 })
  peso_actual: number;

  @Column('decimal', { precision: 5, scale: 2 })
  altura_actual: number;

  @ManyToOne(() => User, user => user.ninos, { onDelete: 'CASCADE' })
  madre: User;

  @OneToMany(() => RegistroDeteccionTemprana, (registro) => registro.nino)
  registros_deteccion_temprana: RegistroDeteccionTemprana[];

  @OneToMany(() => MealLog, (mealLog) => mealLog.patient)
  meal_logs: MealLog[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Método helper para calcular la edad en meses
  getAgeInMonths(): number {
    const now = new Date();
    const birthDate = new Date(this.fecha_nacimiento);
    const months = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
    return Math.max(0, months);
  }
}
