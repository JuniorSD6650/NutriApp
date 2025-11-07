import { IsUUID, IsNumber, Min, IsString, IsOptional } from 'class-validator';

export class CreatePlatilloIngredienteDto {
  @IsUUID()
  ingredienteId: string;

  @IsNumber()
  @Min(0)
  cantidad: number;

  @IsString()
  @IsOptional()
  unidad?: string = 'g';
}
