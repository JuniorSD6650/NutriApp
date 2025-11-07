// src/users/users.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PacienteProfile } from './entities/paciente-profile.entity';
import { MedicoProfile } from './entities/medico-profile.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ProfilesController } from './profiles.controller';
import { PacienteProfilesService } from './paciente-profiles.service';
import { MedicoProfilesService } from './medico-profiles.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PacienteProfile, MedicoProfile])
  ],
  controllers: [UsersController, ProfilesController],
  providers: [UsersService, PacienteProfilesService, MedicoProfilesService],
  exports: [UsersService, PacienteProfilesService, MedicoProfilesService],
})
export class UsersModule { }