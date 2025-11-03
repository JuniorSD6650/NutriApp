import { IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterAuthDto {
  @ApiProperty({ example: 'María González', description: 'Nombre completo del usuario' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'maria@gmail.com', description: 'Email único del usuario' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456789', description: 'Contraseña (mínimo 8 caracteres)' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ 
    example: 'madre', 
    description: 'Rol del usuario',
    enum: ['madre', 'admin'],
    default: 'madre'
  })
  @IsOptional()
  @IsIn(['madre', 'admin'])
  rol?: string;
}

export class LoginAuthDto {
  @ApiProperty({ example: 'maria@gmail.com', description: 'Email del usuario' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', description: 'Contraseña del usuario' })
  @IsString()
  password: string;
}
