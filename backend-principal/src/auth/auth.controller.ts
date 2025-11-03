import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterAuthDto, LoginAuthDto } from './dto/register-auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiBody({ type: RegisterAuthDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario registrado exitosamente',
    schema: {
      example: {
        user: {
          id: 'uuid-here',
          nombre: 'María González',
          email: 'maria@gmail.com',
          rol: 'madre'
        },
        token: 'jwt-token-here'
      }
    }
  })
  @ApiResponse({ status: 409, description: 'El email ya existe' })
  async register(@Body(ValidationPipe) registerDto: RegisterAuthDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginAuthDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Login exitoso',
    schema: {
      example: {
        user: {
          id: 'uuid-here',
          nombre: 'María González',
          email: 'maria@gmail.com',
          rol: 'madre'
        },
        token: 'jwt-token-here'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body(ValidationPipe) loginDto: LoginAuthDto) {
    return this.authService.login(loginDto);
  }
}
