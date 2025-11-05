import { Controller, Post, Body, ValidationPipe, HttpCode, HttpStatus, Delete, Param, UseGuards, Patch, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterAuthDto, LoginAuthDto } from './dto/register-auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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
  @HttpCode(HttpStatus.OK)
  async login(@Body(ValidationPipe) loginDto: LoginAuthDto) {
    return this.authService.login(loginDto);
  }

  @Delete('users/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Eliminar usuario (solo admin)' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }

  @Patch('users/:id/deactivate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Desactivar usuario (solo admin)' })
  @ApiResponse({ status: 200, description: 'Usuario desactivado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async deactivateUser(@Param('id') id: string) {
    return this.authService.deactivateUser(id);
  }

  @Patch('users/:id/activate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Activar usuario (solo admin)' })
  @ApiResponse({ status: 200, description: 'Usuario activado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async activateUser(@Param('id') id: string) {
    return this.authService.activateUser(id);
  }

  @Get('users/active')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener usuarios activos' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios activos' })
  async getActiveUsers() {
    return this.authService.getActiveUsers();
  }

  @Get('users/inactive')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener usuarios inactivos' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios inactivos' })
  async getInactiveUsers() {
    return this.authService.getInactiveUsers();
  }

  @Get('users/all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener todos los usuarios (activos y desactivados)' })
  @ApiResponse({ status: 200, description: 'Lista de todos los usuarios' })
  async getAllUsers() {
    return this.authService.getAllUsers();
  }
}
