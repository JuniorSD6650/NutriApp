// ...existing imports...
// src/users/users.service.ts

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not, Like } from 'typeorm';
import { User } from './entities/user.entity';
import { PacienteProfile } from './entities/paciente-profile.entity';
import { MedicoProfile } from './entities/medico-profile.entity';
import { Role } from './enums/role.enum';
import { QueryUserDto } from './dto/query-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FiltroEstado } from '../common/enums/filtro-estado.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(PacienteProfile)
        private readonly pacienteProfileRepository: Repository<PacienteProfile>,
        @InjectRepository(MedicoProfile)
        private readonly medicoProfileRepository: Repository<MedicoProfile>,
    ) { }

    async findOneWithProfiles(id: string) {
        return this.userRepository.findOne({
            where: { id },
            relations: ['pacienteProfile', 'medicoProfile'],
        });
    }

    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.userRepository.findOne({ where: { email } });

        if (!user) {
            return null; // Usuario no existe
        }

        if (!user.password) {
            return null; // No hay contraseña almacenada
        }

        if (!user.isActive) {
            return null; // Usuario desactivado
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return null; // Contraseña incorrecta
        }

        return user;
    }


    async findAll(query: QueryUserDto) {
        const { page = 1, limit = 10, role, name } = query;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (role) where.role = role;
        if (name) where.name = Like(`%${name}%`);

        const [data, total] = await this.userRepository.findAndCount({
            where,
            take: limit,
            skip,
            order: { createdAt: 'DESC' },
            select: ['id', 'name', 'email', 'role', 'isActive'], // Asegúrate de incluir `isActive`
        });

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: string) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        return user;
    }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const { email, password, name, role, medicoProfile, pacienteProfile } = createUserDto as any;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        try {
            const newUser = this.userRepository.create({
                email,
                password: hashedPassword,
                name,
                role,
            });
            const savedUser = await this.userRepository.save(newUser);

            // Crear perfil si corresponde
            if (role === Role.MEDICO && medicoProfile) {
                await this.medicoProfileRepository.save({ ...medicoProfile, user: savedUser });
            }
            if (role === Role.PACIENTE && pacienteProfile) {
                await this.pacienteProfileRepository.save({ ...pacienteProfile, user: savedUser });
            }
            return savedUser;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
                throw new ConflictException('Ya existe un usuario con ese email');
            }
            throw error;
        }
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        const user = await this.findOne(id);
        Object.assign(user, updateUserDto);
        try {
            return await this.userRepository.save(user);
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
                throw new ConflictException('Ya existe un usuario con ese email');
            }
            throw error;
        }
    }

    async deactivate(id: string) {
        const user = await this.findOne(id);
        if (!user.isActive) {
            throw new ConflictException('El usuario ya está inactivo');
        }
        user.isActive = false;
        await this.userRepository.save(user);
        return { message: `Usuario ${user.name} desactivado.` };
    }

    async restore(id: string) {
        const user = await this.findOne(id);
        if (user.isActive) {
            throw new ConflictException('El usuario ya está activo');
        }
        user.isActive = true;
        await this.userRepository.save(user);
        return { message: `Usuario ${user.name} activado.` };
    }

    async remove(id: string, confirmName: string) {
        const user = await this.findOne(id);
        if (user.name !== confirmName) {
            throw new BadRequestException(`El nombre de confirmación '${confirmName}' no coincide con '${user.name}'.`);
        }
        await this.userRepository.remove(user);
        return { message: `Usuario ${user.name} eliminado permanentemente.` };
    }

    async findOneByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

}