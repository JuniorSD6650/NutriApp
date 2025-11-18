import { IsEnum, IsOptional, IsString, IsUUID, IsNumber, Min } from 'class-validator';
import { TipoComida } from '../enums/tipo-comida.enum';

export class CreateRegistroConsumoDto {
  @IsEnum(TipoComida)
  tipo_comida: TipoComida;

  @IsUUID()
  platilloId: string; // <-- NUEVO: ID del platillo seleccionado

  @IsNumber()
  @Min(0.1)
  @IsOptional()
  porciones?: number; // <-- NUEVO: por defecto 1 si no se envía

  @IsString()
  @IsOptional()
  descripcion?: string; // <-- Para modo "Describir"
}
