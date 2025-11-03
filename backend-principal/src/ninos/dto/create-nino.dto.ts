import { IsString, IsDateString, IsEnum, IsOptional, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNinoDto {
  @ApiProperty({ example: 'Sofía González', description: 'Nombre completo del niño' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: '2022-03-15', description: 'Fecha de nacimiento (YYYY-MM-DD)' })
  @IsDateString()
  fecha_nacimiento: string;

  @ApiProperty({ 
    example: 'femenino', 
    description: 'Género del niño',
    enum: ['masculino', 'femenino']
  })
  @IsEnum(['masculino', 'femenino'])
  genero: string;

  @ApiPropertyOptional({ example: 12.5, description: 'Peso actual en kilogramos' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  peso_actual?: number;

  @ApiPropertyOptional({ example: 82.0, description: 'Altura actual en centímetros' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  altura_actual?: number;
}

export class UpdateNinoDto {
  @ApiPropertyOptional({ example: 'Sofía González Updated', description: 'Nombre completo del niño' })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({ example: '2022-03-15', description: 'Fecha de nacimiento (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fecha_nacimiento?: string;

  @ApiPropertyOptional({ 
    example: 'femenino', 
    description: 'Género del niño',
    enum: ['masculino', 'femenino']
  })
  @IsOptional()
  @IsEnum(['masculino', 'femenino'])
  genero?: string;

  @ApiPropertyOptional({ example: 13.2, description: 'Peso actual en kilogramos' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  peso_actual?: number;

  @ApiPropertyOptional({ example: 85.0, description: 'Altura actual en centímetros' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  altura_actual?: number;
}
