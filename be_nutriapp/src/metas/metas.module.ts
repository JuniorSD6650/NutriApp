import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetaDiaria } from './entities/meta-diaria.entity';
import { MetasService } from './metas.service';
import { MetasController } from './metas.controller';
import { UsersModule } from '../users/users.module';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MetaDiaria]),
    forwardRef(() => UsersModule),
    forwardRef(() => ProfilesModule),
  ],
  providers: [MetasService],
  controllers: [MetasController],
  exports: [MetasService],
})
export class MetasModule {}
