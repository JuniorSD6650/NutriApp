// src/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Request, Patch, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from './decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { RolesGuard } from './guards/roles.guard';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    signIn(@Body() signInDto: Record<string, any>) {
        return this.authService.signIn(signInDto.email, signInDto.password);
    }

    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    refresh(@Body() body: { refresh_token: string }) {
        return this.authService.refresh(body.refresh_token);
    }

    // (Opcional) Endpoint para "logout" (revocar refresh token si se almacena en BD)
    @HttpCode(HttpStatus.OK)
    @Post('logout')
    logout(@Body() body: { refresh_token: string }) {
        return this.authService.revokeRefreshToken(body.refresh_token);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    async getProfile(@Request() req) {
        // req.user.sub contiene el id del usuario autenticado
        return this.authService.getUserWithProfiles(req.user.sub);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('change-password')
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async changePassword(
        @Request() req,
        @Body() body: ChangePasswordDto
    ) {
        return this.authService.changePassword(req.user.sub, body.currentPassword, body.newPassword);
    }

}