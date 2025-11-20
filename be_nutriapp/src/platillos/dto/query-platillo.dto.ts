import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { FiltroEstado } from '../../common/enums/filtro-estado.enum';

export class QueryPlatilloDto extends PaginationDto {
  @IsOptional()
  @IsString()
  name?: string; // Cambia el nombre del parámetro de `search` a `name`

  @IsOptional()
  @IsEnum(FiltroEstado)
  estado?: FiltroEstado;
}
