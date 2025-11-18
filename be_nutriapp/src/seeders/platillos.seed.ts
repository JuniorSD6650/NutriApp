import { DataSource } from 'typeorm';
import { Platillo } from '../platillos/entities/platillo.entity';

export const platillosSeed = async (dataSource: DataSource) => {
  const platilloRepo = dataSource.getRepository(Platillo);

  if (await platilloRepo.count()) {
    console.log('⚠️ Ya existen platillos. Omitiendo seeder.');
    return;
  }

  const platillos = [
    { nombre: 'Lentejas guisadas con arroz', descripcion: 'Lentejas cocidas con arroz integral y vegetales' },
    { nombre: 'Hígado encebollado', descripcion: 'Hígado de res salteado con cebolla y pimientos' },
    { nombre: 'Ensalada de espinacas con quinoa', descripcion: 'Espinacas frescas con quinoa, tomate y aguacate' },
    { nombre: 'Tacos de carne con frijoles', descripcion: 'Tortillas con carne de res, frijoles negros y aguacate' },
    { nombre: 'Bowl de tofu con vegetales', descripcion: 'Tofu salteado con brócoli, espinaca y quinoa' },
    { nombre: 'Garbanzos al curry con arroz', descripcion: 'Garbanzos cocidos en salsa de curry con arroz' },
    { nombre: 'Avena con almendras y fresas', descripcion: 'Avena fortificada con almendras, fresas y naranja' },
    { nombre: 'Pollo con brócoli y arroz', descripcion: 'Pechuga de pollo con brócoli al vapor y arroz' },
    { nombre: 'Ensalada de atún con huevo', descripcion: 'Atún con huevo cocido, tomate y espinaca' },
    { nombre: 'Wrap de frijoles y aguacate', descripcion: 'Tortilla integral con frijoles, aguacate y queso' },
  ];

  for (const p of platillos) {
    await platilloRepo.save(p);
  }

  console.log(`✅ ${platillos.length} platillos creados.`);
};
