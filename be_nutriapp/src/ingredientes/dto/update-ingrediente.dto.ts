// src/ingredientes/dto/update-ingrediente.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateIngredienteDto } from './create-ingrediente.dto';

// Permite actualizar el nombre, los nutrientes, o ambos.
export class UpdateIngredienteDto extends PartialType(CreateIngredienteDto) {}