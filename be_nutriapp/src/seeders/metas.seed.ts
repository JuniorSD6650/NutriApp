import { DataSource } from 'typeorm';
import { MetaDiaria } from '../metas/entities/meta-diaria.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/enums/role.enum';

export const metasSeed = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(MetaDiaria);
  const userRepo = dataSource.getRepository(User);
  if (await repo.count()) return;
  const paciente = await userRepo.findOne({ where: { role: Role.PACIENTE } });
  const medico = await userRepo.findOne({ where: { role: Role.MEDICO } });
  if (!paciente || !medico) return;
  await repo.save({
    fecha: new Date().toISOString().slice(0, 10),
    caloriasObjetivo: 2000,
    proteinasObjetivo: 100,
    grasasObjetivo: 70,
    carbohidratosObjetivo: 250,
    paciente,
    medico,
  });
  await repo.save({
    fecha: new Date().toISOString().slice(0, 10),
    caloriasObjetivo: 1800,
    proteinasObjetivo: 90,
    grasasObjetivo: 60,
    carbohidratosObjetivo: 220,
    paciente,
    medico,
  });
};
