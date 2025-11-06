// src/users/users.controller.ts

import { Controller, Post, Body, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { Role } from './enums/role.enum';

@Controller('users') 
export class UsersController {

  constructor(private readonly usersService: UsersService) {}

  @Post()
  async register(
    @Body('email') email: string,
    @Body('password') pass: string,
    @Body('name') name: string,
    @Body('role') role: Role,
  ) {
    try {
      const newUser = await this.usersService.create(email, pass, name, role);
      const { password, ...result } = newUser;
      return result;
    } catch (error) {
      return {
        statusCode: 400,
        message: 'Error al registrar el usuario.',
        error: error.message,
      };
    }
  }

  @Get()
  async tempFindAll() {
    return 'Endpoint de usuarios (GET) funcionando!';
  }
}