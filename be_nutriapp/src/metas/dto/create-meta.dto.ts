import { IsDateString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateMetaDto {
  @IsDateString()
  fecha: string;


  @IsNumber()
  hierroObjetivo: number;

  @IsUUID()
  pacienteId: string;
}
