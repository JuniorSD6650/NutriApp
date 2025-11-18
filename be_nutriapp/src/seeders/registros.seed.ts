import { DataSource } from 'typeorm';
import { RegistroConsumo } from '../registros/entities/registro-consumo.entity';
import { User } from '../users/entities/user.entity';
import { Platillo } from '../platillos/entities/platillo.entity';
import { TipoComida } from '../registros/enums/tipo-comida.enum';
import { Role } from '../users/enums/role.enum';

export const registrosSeed = async (dataSource: DataSource) => {
  const registroRepo = dataSource.getRepository(RegistroConsumo);
  const userRepo = dataSource.getRepository(User);
  const platilloRepo = dataSource.getRepository(Platillo);

  // CAMBIO: Solo verificar si hay registros
  const count = await registroRepo.count();
  if (count > 0) {
    console.log(`⚠️ Ya existen ${count} registros. Omitiendo seeder de registros.`);
    return;
  }

  const pacientes = await userRepo.find({ where: { role: Role.PACIENTE } });
  if (pacientes.length === 0) {
    console.log('⚠️ No hay pacientes. Omitiendo seeder de registros.');
    return;
  }

  const platillos = await platilloRepo.find({
    relations: ['ingredientes', 'ingredientes.ingrediente', 'ingredientes.ingrediente.nutrientes']
  });
  if (platillos.length === 0) {
    console.log('⚠️ No hay platillos disponibles para crear registros.');
    return;
  }

  console.log(`📝 Creando registros para ${pacientes.length} paciente(s) desde 17/11/2025...`);

  const tiposComida = [TipoComida.DESAYUNO, TipoComida.ALMUERZO, TipoComida.CENA, TipoComida.SNACK];
  const diasAGenerar = 40;

  for (const paciente of pacientes) {
    let totalRegistrosPaciente = 0;
    
    for (let dia = 0; dia < diasAGenerar; dia++) {
      const fechaBase = new Date(2025, 10, 17 + dia, 0, 0, 0, 0);
      const registrosPorDia = Math.floor(Math.random() * 3) + 2; // 2, 3 o 4
      const tiposUsados = new Set<TipoComida>();

      for (let i = 0; i < registrosPorDia; i++) {
        let tipoComida: TipoComida;
        let intentos = 0;
        
        do {
          tipoComida = tiposComida[Math.floor(Math.random() * tiposComida.length)];
          intentos++;
        } while (tiposUsados.has(tipoComida) && intentos < 20);
        
        if (tiposUsados.has(tipoComida)) continue; // Saltar si ya se usó
        tiposUsados.add(tipoComida);

        const platillo = platillos[Math.floor(Math.random() * platillos.length)];
        const porciones = (Math.floor(Math.random() * 15) + 5) / 10; // 0.5 a 2.0

        const descripciones = ['Delicioso', 'Rico', 'Comida casera', null, null, null];
        const descripcion = descripciones[Math.floor(Math.random() * descripciones.length)];

        const fechaConHora = new Date(fechaBase);
        
        if (tipoComida === TipoComida.DESAYUNO) {
          fechaConHora.setHours(7 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
        } else if (tipoComida === TipoComida.ALMUERZO) {
          fechaConHora.setHours(12 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
        } else if (tipoComida === TipoComida.CENA) {
          fechaConHora.setHours(19 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
        } else {
          fechaConHora.setHours(15 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
        }

        await registroRepo.save({
          usuario: paciente,
          platillo: platillo,
          tipo_comida: tipoComida,
          porciones: porciones,
          descripcion: descripcion || undefined,
          foto: undefined,
          fecha: fechaConHora,
        } as any);
        
        totalRegistrosPaciente++;
      }
    }

    console.log(`✅ ${totalRegistrosPaciente} registros creados para paciente: ${paciente.email}`);
  }

  console.log('✅ Todos los registros han sido creados exitosamente.');
};