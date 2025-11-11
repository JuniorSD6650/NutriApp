import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TipoComida } from '../enums/tipo-comida.enum';

export class UpdateRegistroConsumoDto {
  @IsEnum(TipoComida)
  @IsOptional()
  tipo_comida?: TipoComida;

  @IsString()
  @IsOptional()
  descripcion?: string;

  // No se permite cambiar la foto aquí por simplicidad
}
