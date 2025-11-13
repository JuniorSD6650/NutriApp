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

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return null; // Contraseña incorrecta
        }

        return user;
    }


    async findAll(query: QueryUserDto) {
        const { page = 1, limit = 5, search, estado = FiltroEstado.ACTIVO } = query;
        const skip = (page - 1) * limit;
        const where: any = {};
        if (search) {
            where.name = Like(`%${search}%`);
        }
        if (estado === FiltroEstado.ACTIVO) {
            where.isActive = true;
        } else if (estado === FiltroEstado.INACTIVO) {
            where.isActive = false;
        }
        const [data, total] = await this.userRepository.findAndCount({
            where,
            take: limit,
            skip,
            order: { createdAt: 'DESC' },
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
        const { email, password, name, role } = createUserDto;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        try {
            const newUser = this.userRepository.create({
                email,
                password: hashedPassword,
                name,
                role,
            });
            return await this.userRepository.save(newUser);
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

    /**
     * Devuelve el usuario médico con la relación pacientes
     */
    async findMedicoWithPacientes(id: string) {
        return this.userRepository.findOne({
            where: { id },
            relations: ['pacientes'],
            select: ['id', 'name', 'pacientes'],
        });
    }

    /**
     * Asigna uno o varios pacientes a un médico
     */
    async asignarPacientesAMedico(medicoId: string, pacienteIds: string[]) {
        // Busca el médico
        const medico = await this.userRepository.findOne({ where: { id: medicoId } });
        if (!medico) throw new NotFoundException('Médico no encontrado');
        // Busca los pacientes
        const pacientes = await this.userRepository.findByIds(pacienteIds);
        // Asigna el médico a cada paciente
        for (const paciente of pacientes) {
            paciente.medico = medico;
        }
        await this.userRepository.save(pacientes);
        return { message: `Pacientes asignados correctamente`, total: pacientes.length };
    }

}