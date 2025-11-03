import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateIngredientDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  iron_mg_per_100g: number;

  @IsNumber()
  @Min(0)
  calories_per_100g: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  protein_g_per_100g?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  carbs_g_per_100g?: number;
}

export class UpdateIngredientDto extends PartialType(CreateIngredientDto) {}
