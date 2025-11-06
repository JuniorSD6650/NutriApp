// src/ingredientes/nutrientes/dto/query-nutriente.dto.ts
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { FiltroEstado } from '../../../common/enums/filtro-estado.enum'; // <-- IMPORTAR

export class QueryNutrienteDto extends PaginationDto {
  
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(FiltroEstado)
  estado: FiltroEstado = FiltroEstado.ACTIVO; // <-- Default: ACTIVO
}