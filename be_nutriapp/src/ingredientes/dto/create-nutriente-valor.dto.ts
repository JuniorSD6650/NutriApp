// src/ingredientes/dto/create-nutriente-valor.dto.ts
import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class CreateNutrienteValorDto {
  @IsUUID()
  @IsNotEmpty()
  nutrienteId: string;

  @IsNumber()
  @Min(0)
  value: number;
}