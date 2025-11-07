import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';
import { TipoDieta } from '../entities/paciente-profile.entity';

export class CreatePacienteProfileDto {
  @IsDateString()
  fecha_nacimiento: string;

  @IsNumber()
  peso_inicial_kg: number;

  @IsNumber()
  altura_cm: number;

  @IsDateString()
  @IsOptional()
  fecha_probable_parto?: string;

  @IsNumber()
  @IsOptional()
  semanas_gestacion?: number;

  @IsEnum(TipoDieta)
  @IsOptional()
  tipo_dieta?: TipoDieta;

  @IsString()
  @IsOptional()
  alergias_alimentarias?: string;

  @IsBoolean()
  @IsOptional()
  toma_suplementos_hierro?: boolean;
}
