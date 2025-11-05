import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RegisterAuthDto, LoginAuthDto } from './dto/register-auth.dto';
import { Nino } from '../ninos/entities/nino.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterAuthDto) {
    const { email, password, nombre, rol = 'madre' } = registerDto;

    // Check if user exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      nombre,
      email,
      password_hash,
      rol,
    });

    const savedUser = await this.userRepository.save(user);

    // Generate token
    const payload = { sub: savedUser.id, email: savedUser.email, rol: savedUser.rol };
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: savedUser.id,
        nombre: savedUser.nombre,
        email: savedUser.email,
        rol: savedUser.rol,
      },
      token,
    };
  }

  async login(loginDto: LoginAuthDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verificar si el usuario está activo
    if (!user.activo) {
      throw new UnauthorizedException('Usuario desactivado. Contacte al administrador.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate token
    const payload = { sub: user.id, email: user.email, rol: user.rol };
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
      token,
    };
  }

  async deleteUser(id: string) {
    const user = await this.userRepository.findOne({ 
      where: { id },
      relations: ['ninos'] // Agregar relación
    });
    
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Cargar registros asociados de cada niño
    let totalDetections = 0;
    let totalMealLogs = 0;
    if (user.ninos && user.ninos.length > 0) {
      // Cargar relaciones para cada niño
      for (const nino of user.ninos) {
        const ninoFull = await this.userRepository.manager.findOne(Nino, {
          where: { id: nino.id },
          relations: ['registros_deteccion_temprana', 'meal_logs']
        });
        totalDetections += ninoFull?.registros_deteccion_temprana?.length || 0;
        totalMealLogs += ninoFull?.meal_logs?.length || 0;
      }
      // Solo impedir si hay registros asociados
      if (totalDetections > 0 || totalMealLogs > 0) {
        throw new ConflictException(
          `No se puede eliminar usuario con datos asociados. Registros: ${totalDetections} detecciones, ${totalMealLogs} registros nutricionales`
        );
      }
    }

    await this.userRepository.remove(user);
    
    return {
      message: `Usuario "${user.nombre}" eliminado exitosamente`,
      deletedUser: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
      }
    };
  }

  async deactivateUser(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    if (!user.activo) {
      return { message: `El usuario "${user.nombre}" ya está desactivado.` };
    }
    user.activo = false;
    await this.userRepository.save(user);
    return {
      message: `Usuario "${user.nombre}" desactivado exitosamente`,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        activo: user.activo,
        rol: user.rol,
      }
    };
  }

  async activateUser(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    if (user.activo) {
      return { message: `El usuario "${user.nombre}" ya está activado.` };
    }
    user.activo = true;
    await this.userRepository.save(user);
    return {
      message: `Usuario "${user.nombre}" activado exitosamente`,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        activo: user.activo,
        rol: user.rol,
      }
    };
  }

  async getActiveUsers() {
    return this.userRepository.find({ where: { activo: true } });
  }

  async getInactiveUsers() {
    return this.userRepository.find({ where: { activo: false } });
  }

  async getAllUsers() {
    return this.userRepository.find();
  }
}
