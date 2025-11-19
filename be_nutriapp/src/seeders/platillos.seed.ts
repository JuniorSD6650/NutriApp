import { DataSource } from 'typeorm';
import { Platillo } from '../platillos/entities/platillo.entity';

export const platillosSeed = async (dataSource: DataSource) => {
  const platilloRepo = dataSource.getRepository(Platillo);

  const platillos = [
    { nombre: 'Lentejas guisadas con arroz' },
    { nombre: 'Hígado encebollado' },
    { nombre: 'Ensalada de espinacas con quinoa' },
    { nombre: 'Tacos de carne con frijoles' },
    { nombre: 'Bowl de tofu con vegetales' },
    { nombre: 'Garbanzos al curry con arroz' },
    { nombre: 'Avena con almendras y fresas' },
    { nombre: 'Pollo con brócoli y arroz' },
    { nombre: 'Ensalada de atún con huevo' },
    { nombre: 'Wrap de frijoles y aguacate' },
  ];

  for (const platilloData of platillos) {
    const exists = await platilloRepo.findOne({ where: { nombre: platilloData.nombre } });
    if (!exists) {
      await platilloRepo.save(platilloRepo.create(platilloData));
    }
  }
};
