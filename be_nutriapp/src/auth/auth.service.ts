// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshToken } from './entities/refresh-token.entity';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Role } from '../users/enums/role.enum'; // <-- AÑADIR IMPORT

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) { }

  async signIn(email: string, pass: string) {
    // Validación básica
    if (!email || !pass) {
      throw new UnauthorizedException('Email y contraseña son requeridos');
    }

    const user = await this.usersService.validateUser(email, pass);

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '30d',
    });

    // Guardar el refresh token en la base de datos
    await this.refreshTokenRepository.save({
      token: refreshToken,
      user: user,
      revoked: false,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    try {
      // Verificar el token y buscarlo en la base de datos
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      const tokenEntity = await this.refreshTokenRepository.findOne({ where: { token: refreshToken }, relations: ['user'] });
      if (!tokenEntity || tokenEntity.revoked) {
        throw new ForbiddenException('Refresh token revocado o no encontrado');
      }
      const newAccessToken = await this.jwtService.signAsync({
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      });
      return {
        access_token: newAccessToken,
      };
    } catch (e) {
      throw new ForbiddenException('Refresh token inválido o expirado');
    }
  }

  async revokeRefreshToken(refreshToken: string) {
    const tokenEntity = await this.refreshTokenRepository.findOne({ where: { token: refreshToken } });
    if (tokenEntity) {
      tokenEntity.revoked = true;
      await this.refreshTokenRepository.save(tokenEntity);
    }
    return { message: 'Sesión cerrada (refresh token revocado si aplica)' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.password) {
        throw new UnauthorizedException('Usuario no encontrado');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        throw new BadRequestException('La contraseña actual es incorrecta');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.usersService.update(userId, { password: hashedPassword });

    return { message: 'Contraseña cambiada exitosamente' };
  }

  async getUserWithProfiles(userId: string) {
    const user = await this.usersService.findOne(userId);
    
    // VALIDACIÓN: Si el usuario no existe (por ejemplo, se borró la DB)
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado. Token inválido.');
    }

    // Si es paciente, incluir su perfil
    if (user.role === Role.PACIENTE && user.pacienteProfile) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        pacienteProfile: {
          fecha_nacimiento: user.pacienteProfile.fecha_nacimiento,
          peso_inicial_kg: user.pacienteProfile.peso_inicial_kg,
          altura_cm: user.pacienteProfile.altura_cm,
          alergias_alimentarias: user.pacienteProfile.alergias_alimentarias,
          toma_suplementos_hierro: user.pacienteProfile.toma_suplementos_hierro,
        },
      };
    }

    // Si es médico, incluir su perfil
    if (user.role === Role.MEDICO && user.medicoProfile) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        medicoProfile: {
          especialidad: user.medicoProfile.especialidad,
          numero_colegiado: user.medicoProfile.numero_colegiado,
          biografia: user.medicoProfile.biografia,
        },
      };
    }

    // Si es admin o no tiene perfil, solo datos básicos
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}