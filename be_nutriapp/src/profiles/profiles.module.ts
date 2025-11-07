import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesService } from './profiles.service';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => UsersModule)],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
