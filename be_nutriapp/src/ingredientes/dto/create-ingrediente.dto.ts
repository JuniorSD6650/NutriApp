// src/ingredientes/dto/create-ingrediente.dto.ts
import { 
  IsString, 
  IsNotEmpty, 
  IsArray, 
  ValidateNested, 
  ArrayMinSize
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateNutrienteValorDto } from './create-nutriente-valor.dto';

export class CreateIngredienteDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true }) // Valida cada objeto del array
  @Type(() => CreateNutrienteValorDto) // Le dice cómo validar el array
  nutrientes: CreateNutrienteValorDto[];
}