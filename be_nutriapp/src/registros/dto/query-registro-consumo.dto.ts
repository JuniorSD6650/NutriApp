import { IsOptional, IsEnum } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { TipoComida } from '../enums/tipo-comida.enum';

export class QueryRegistroConsumoDto extends PaginationDto {
  @IsOptional()
  @IsEnum(TipoComida)
  tipo_comida?: TipoComida;
}
