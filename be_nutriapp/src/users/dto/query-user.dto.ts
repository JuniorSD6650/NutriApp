import { IsOptional, IsEnum, IsString } from 'class-validator';
import { Role } from '../enums/role.enum';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { FiltroEstado } from '../../common/enums/filtro-estado.enum';

export class QueryUserDto extends PaginationDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(FiltroEstado)
  estado: FiltroEstado = FiltroEstado.ACTIVO;
}
