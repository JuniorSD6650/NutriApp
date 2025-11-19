// src/seeders/users.seed.ts
import { Role } from '../users/enums/role.enum';

// Primero generamos los médicos
const medicos = Array.from({ length: 5 }).map((_, i) => ({
  email: `medico${i+1}@nutriapp.com`,
  password: `medico${i+1}123`,
  name: `Dr. Nutri${i+1}`,
  role: Role.MEDICO,
}));

// Tipo explícito para pacientes con medicoId
type PacienteSeed = {
  email: string;
  password: string;
  name: string;
  role: Role;
  medicoId?: number; // <-- AÑADIR CAMPO OPCIONAL
};

const pacientes: PacienteSeed[] = Array.from({ length: 15 }).map((_, i) => ({
  email: `paciente${i+1}@nutriapp.com`,
  password: `paciente${i+1}123`,
  name: `Paciente Demo${i+1}`,
  role: Role.PACIENTE,
  medicoId: (i % 5) + 1,
}));

export const usersSeed = [
  {
    email: 'admin@nutriapp.com',
    password: 'admin123',
    name: 'Administrador',
    role: Role.ADMIN,
  },
  ...medicos,
  ...pacientes,
];
