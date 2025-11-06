// src/common/dto/pagination.dto.ts
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number) // Transforma el query param (string) a número
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 5;
}