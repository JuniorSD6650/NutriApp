import { DataSource } from 'typeorm';
import { RegistroConsumo } from '../registros/entities/registro-consumo.entity';
import { User } from '../users/entities/user.entity';
import { TipoComida } from '../registros/enums/tipo-comida.enum';
import { Role } from '../users/enums/role.enum';

export const registrosSeed = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(RegistroConsumo);
  const userRepo = dataSource.getRepository(User);
  if (await repo.count()) return;
  const paciente = await userRepo.findOne({ where: { role: Role.PACIENTE } });
  if (!paciente) return;
  await repo.save([
    { usuario: paciente, tipo_comida: TipoComida.DESAYUNO, descripcion: 'Avena con leche', foto: '/uploads/consumo/1.jpg', fecha: new Date() },
    { usuario: paciente, tipo_comida: TipoComida.ALMUERZO, descripcion: 'Pollo con arroz', foto: '/uploads/consumo/2.jpg', fecha: new Date() },
    { usuario: paciente, tipo_comida: TipoComida.CENA, descripcion: 'Ensalada', foto: '/uploads/consumo/3.jpg', fecha: new Date() },
  ]);
};
