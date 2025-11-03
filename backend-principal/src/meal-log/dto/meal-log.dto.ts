import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateMealLogDto {
  @IsUUID()
  patientId: string;

  @IsString()
  @IsOptional()
  dishId?: string;

  @IsString()
  @IsOptional()
  dishName?: string;
}
