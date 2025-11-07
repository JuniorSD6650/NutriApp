// src/users/users.controller.ts

import { Controller, Post, Body, Get, Patch, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Role } from './enums/role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { ConfirmDeleteDto } from '../common/dto/confirm-delete.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role as RoleEnum } from './enums/role.enum';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(RoleEnum.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Query() query: QueryUserDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  @Patch(':id/restore')
  async restore(@Param('id') id: string) {
    return this.usersService.restore(id);
  }

  @Post(':id/force-delete')
  async forceDelete(@Param('id') id: string, @Body() confirmDto: ConfirmDeleteDto) {
    return this.usersService.remove(id, confirmDto.name);
  }
}