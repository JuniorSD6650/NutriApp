import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TipoComida } from '../enums/tipo-comida.enum';

export class CreateRegistroConsumoDto {
  @IsEnum(TipoComida)
  tipo_comida: TipoComida;

  @IsString()
  @IsOptional()
  descripcion?: string;
}
