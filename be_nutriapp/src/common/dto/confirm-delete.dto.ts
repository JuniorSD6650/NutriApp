// src/common/dto/confirm-delete.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class ConfirmDeleteDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}