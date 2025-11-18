import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistroConsumo } from './entities/registro-consumo.entity';
import { RegistrosService } from './registros.service';
import { RegistrosController } from './registros.controller';
import { MulterModule } from '@nestjs/platform-express';
import { User } from '../users/entities/user.entity';
import { Platillo } from '../platillos/entities/platillo.entity'; // <-- AÑADIR
import { diskStorage } from 'multer';
import { join } from 'path';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RegistroConsumo, User, Platillo]), // <-- AÑADIR Platillo
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, join(__dirname, '../../uploads/consumo'));
        },
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = file.originalname.split('.').pop();
          cb(null, `${unique}.${ext}`);
        },
      }),
    }),
    forwardRef(() => ProfilesModule),
  ],
  controllers: [RegistrosController],
  providers: [RegistrosService],
})
export class RegistrosModule {}
