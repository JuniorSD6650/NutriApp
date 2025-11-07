import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMedicoProfileDto {
  @IsString()
  @IsNotEmpty()
  especialidad: string;

  @IsString()
  @IsNotEmpty()
  numero_colegiado: string;

  @IsString()
  @IsOptional()
  biografia?: string;
}
