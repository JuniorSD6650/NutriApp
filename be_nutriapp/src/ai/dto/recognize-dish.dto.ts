import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum MealType {
  DESAYUNO = 'Desayuno',
  ALMUERZO = 'Almuerzo',
  CENA = 'Cena',
  SNACK = 'Snack',
}

export class RecognizeDishDto {
  @IsOptional()
  @IsString()
  imagePath?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(MealType)
  mealType: MealType;

  @IsOptional()
  @IsString()
  imageBase64?: string; // Imagen en base64 para enviar directamente
}
