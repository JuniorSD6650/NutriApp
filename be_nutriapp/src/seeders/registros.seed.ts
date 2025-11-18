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

  // Si ya hay registros, no sembrar
  if (await registroRepo.count()) return;

  // Obtener todos los pacientes
  const pacientes = await userRepo.find({ where: { role: Role.PACIENTE } });
  if (pacientes.length === 0) return;

  // Obtener todos los platillos disponibles
  const platillos = await platilloRepo.find();
  if (platillos.length === 0) {
    console.log('⚠️ No hay platillos disponibles para crear registros. Ejecuta platillosSeed primero.');
    return;
  }

  console.log(`📝 Creando registros para ${pacientes.length} paciente(s) desde 18/11/2024...`);

  const tiposComida = [TipoComida.DESAYUNO, TipoComida.ALMUERZO, TipoComida.CENA, TipoComida.SNACK];
  const fechaInicio = new Date('2025-11-17');
  const diasAGenerar = 40; // 1 mes de registros

  for (const paciente of pacientes) {
    for (let dia = 0; dia < diasAGenerar; dia++) {
      const fecha = new Date(fechaInicio);
      fecha.setDate(fecha.getDate() + dia);

      // Generar entre 2 y 4 registros por día
      const registrosPorDia = Math.floor(Math.random() * 3) + 2; // 2 a 4

      for (let i = 0; i < registrosPorDia; i++) {
        const tipoComida = tiposComida[Math.floor(Math.random() * tiposComida.length)];
        const platillo = platillos[Math.floor(Math.random() * platillos.length)];
        const porciones = Math.floor(Math.random() * 15 + 5) / 10;

        const descripciones = [
          'Delicioso',
          'Rico desayuno',
          'Comida casera',
          'Preparado en casa',
          null,
          null,
        ];
        const descripcion = descripciones[Math.floor(Math.random() * descripciones.length)];

        // SOLUCIÓN: Guardar cada registro individualmente sin array
        await registroRepo.save({
          usuario: paciente,
          platillo: platillo,
          tipo_comida: tipoComida,
          porciones: porciones,
          descripcion: descripcion || undefined, // null → undefined
          foto: undefined, // null → undefined
          fecha: fecha,
        } as any); // <-- CAST EXPLÍCITO para evitar error de tipos
      }
    }

    console.log(`✅ Registros creados para paciente: ${paciente.email}`);
  }

  console.log('✅ Todos los registros han sido creados exitosamente.');
};
