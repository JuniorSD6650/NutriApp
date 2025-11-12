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
    hierroObjetivo: 18,
    hierroConsumido: 0,
    completada: false,
    paciente,
    medico,
  });
  await repo.save({
    fecha: new Date().toISOString().slice(0, 10),
    hierroObjetivo: 15,
    hierroConsumido: 0,
    completada: false,
    paciente,
    medico,
  });
};
