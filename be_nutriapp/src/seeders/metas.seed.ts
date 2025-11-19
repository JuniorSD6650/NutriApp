import { DataSource } from 'typeorm';
import { MetaDiaria } from '../metas/entities/meta-diaria.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/enums/role.enum';
import { RegistroConsumo } from '../registros/entities/registro-consumo.entity';
import { Between, IsNull } from 'typeorm';

export const metasSeed = async (dataSource: DataSource) => {
  const metaRepo = dataSource.getRepository(MetaDiaria);
  const userRepo = dataSource.getRepository(User);
  const registroRepo = dataSource.getRepository(RegistroConsumo);

  if (await metaRepo.count()) return;

  const pacientes = await userRepo.find({ where: { role: Role.PACIENTE } });
  const medicos = await userRepo.find({ where: { role: Role.MEDICO } });

  if (pacientes.length === 0 || medicos.length === 0) {
    return;
  }

  const fechaInicio = new Date('2025-11-17');
  const diasAGenerar = 40;

  for (const paciente of pacientes) {
    const medico = medicos[Math.floor(Math.random() * medicos.length)];

    for (let dia = 0; dia < diasAGenerar; dia++) {
      const fecha = new Date(fechaInicio);
      fecha.setDate(fecha.getDate() + dia);
      const fechaStr = fecha.toISOString().slice(0, 10);

      // CALCULAR hierroConsumido desde los registros del día
      const startOfDay = new Date(`${fechaStr}T00:00:00.000Z`);
      const endOfDay = new Date(`${fechaStr}T23:59:59.999Z`);

      const registros = await registroRepo.find({
        where: {
          usuario: { id: paciente.id },
          fecha: Between(startOfDay, endOfDay),
          deletedAt: IsNull(),
        },
        relations: ['platillo', 'platillo.ingredientes', 'platillo.ingredientes.ingrediente', 'platillo.ingredientes.ingrediente.nutrientes', 'platillo.ingredientes.ingrediente.nutrientes.nutriente'],
      });

      let hierroConsumido = 0;

      for (const registro of registros) {
        if (registro.platillo && registro.platillo.ingredientes) {
          for (const platilloIngrediente of registro.platillo.ingredientes) {
            const cantidadEnGramos = platilloIngrediente.cantidad * registro.porciones;

            for (const ingredienteNutriente of platilloIngrediente.ingrediente.nutrientes) {
              const nutriente = ingredienteNutriente.nutriente;
              const valorPor100g = ingredienteNutriente.value_per_100g;
              const valorTotal = (valorPor100g * cantidadEnGramos) / 100;

              if (nutriente.name.toLowerCase().includes('hierro')) {
                hierroConsumido += valorTotal;
              }
            }
          }
        }
      }

      await metaRepo.save({
        fecha: fechaStr,
        hierroObjetivo: 18 + Math.floor(Math.random() * 10), // 18-27 mg
        hierroConsumido: Math.round(hierroConsumido * 100) / 100,
        completada: hierroConsumido >= 18,
        paciente: paciente,
        medico: medico,
      });
    }

  }

};
