// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshToken } from './entities/refresh-token.entity';

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
}