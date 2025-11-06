// src/ingredientes/nutrientes/dto/create-nutriente.dto.ts
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { Unit } from '../../enums/unit.enum';

export class CreateNutrienteDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(Unit)
  @IsNotEmpty()
  unit: Unit;
}