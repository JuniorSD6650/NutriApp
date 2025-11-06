// src/users/users.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './enums/role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async validateUser(email: string, pass: string): Promise<User | null> {
        const user = await this.findOneByEmail(email);

        if (user && user.password && (await bcrypt.compare(pass, user.password))) {
            return user;
        }

        return null;
    }

    async create(
        email: string,
        pass: string,
        name: string,
        role: Role,
    ): Promise<User> {

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(pass, salt);

        const newUser = this.userRepository.create({
            email: email,
            password: hashedPassword,
            name: name,
            role: role,
        });

        return this.userRepository.save(newUser);
    }

    async findOneByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

}