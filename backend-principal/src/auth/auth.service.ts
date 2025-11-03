import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RegisterAuthDto, LoginAuthDto } from './dto/register-auth.dto';

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
}
