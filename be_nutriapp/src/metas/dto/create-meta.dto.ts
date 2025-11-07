import { IsDateString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateMetaDto {
  @IsDateString()
  fecha: string;

  @IsNumber()
  caloriasObjetivo: number;

  @IsNumber()
  @IsOptional()
  proteinasObjetivo?: number;

  @IsNumber()
  @IsOptional()
  grasasObjetivo?: number;

  @IsNumber()
  @IsOptional()
  carbohidratosObjetivo?: number;

  @IsUUID()
  pacienteId: string;
}
