import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsPositive } from 'class-validator';

export class CreateDishCompositionDto {
  @ApiProperty({ description: 'ID del platillo' })
  @IsNotEmpty()
  @IsString()
  dishId: string;

  @ApiProperty({ description: 'ID del ingrediente' })
  @IsNotEmpty()
  @IsString()
  ingredientId: string;

  @ApiProperty({ description: 'Cantidad en gramos', example: 100 })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  grams: number;
}
