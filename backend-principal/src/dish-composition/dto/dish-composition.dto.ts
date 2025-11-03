import { IsString, IsNumber, Min } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateDishCompositionDto {
  @IsString()
  dishId: string;

  @IsString()
  ingredientId: string;

  @IsNumber()
  @Min(1)
  grams: number;
}

export class UpdateDishCompositionDto extends PartialType(CreateDishCompositionDto) {}
