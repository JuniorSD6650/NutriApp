// src/seeders/users.seed.ts
import { Role } from '../users/enums/role.enum';

export const usersSeed = [
  {
    email: 'admin@nutriapp.com',
    password: 'admin123',
    name: 'Administrador',
    role: Role.ADMIN,
  },
  // 5 médicos
  ...Array.from({ length: 5 }).map((_, i) => ({
    email: `medico${i+1}@nutriapp.com`,
    password: `medico${i+1}123`,
    name: `Dr. Nutri${i+1}`,
    role: Role.MEDICO,
  })),
  // 15 pacientes
  ...Array.from({ length: 15 }).map((_, i) => ({
    email: `paciente${i+1}@nutriapp.com`,
    password: `paciente${i+1}123`,
    name: `Paciente Demo${i+1}`,
    role: Role.PACIENTE,
  })),
];
