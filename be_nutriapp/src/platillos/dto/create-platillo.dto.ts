import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePlatilloIngredienteDto } from './create-platillo-ingrediente.dto';

export class CreatePlatilloDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreatePlatilloIngredienteDto)
  ingredientes?: CreatePlatilloIngredienteDto[];
}
