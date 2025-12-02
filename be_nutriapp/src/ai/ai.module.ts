import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { Platillo } from '../platillos/entities/platillo.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Platillo]),
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
