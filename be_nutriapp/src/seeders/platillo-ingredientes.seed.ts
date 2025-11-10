import { DataSource } from 'typeorm';
import { Platillo } from '../platillos/entities/platillo.entity';
import { PlatilloIngrediente } from '../platillos/entities/platillo-ingrediente.entity';
import { Ingrediente } from '../ingredientes/entities/ingrediente.entity';

export const platilloIngredientesSeed = async (dataSource: DataSource) => {
  const platilloRepo = dataSource.getRepository(Platillo);
  const ingredienteRepo = dataSource.getRepository(Ingrediente);
  const piRepo = dataSource.getRepository(PlatilloIngrediente);

  const platillos = await platilloRepo.find();
  const ingredientes = await ingredienteRepo.find();

  if (!platillos.length || !ingredientes.length) return;
  if (await piRepo.count()) return;

  // Relacionar ingredientes a platillos de ejemplo
  const combinaciones = [
    {
      platillo: 'Ensalada César',
      ingredientes: [
        { name: 'Lechuga', cantidad: 50 },
        { name: 'Pollo', cantidad: 80 },
        { name: 'Queso', cantidad: 20 },
        { name: 'Pan', cantidad: 15 },
      ],
    },
    {
      platillo: 'Tacos de Pollo',
      ingredientes: [
        { name: 'Pollo', cantidad: 70 },
        { name: 'Pan', cantidad: 40 },
        { name: 'Cebolla', cantidad: 10 },
        { name: 'Tomate', cantidad: 15 },
      ],
    },
    {
      platillo: 'Avena con Fruta',
      ingredientes: [
        { name: 'Avena', cantidad: 40 },
        { name: 'Leche', cantidad: 100 },
        { name: 'Manzana', cantidad: 30 },
        { name: 'Banana', cantidad: 30 },
      ],
    },
  ];

  for (const combo of combinaciones) {
    const platillo = platillos.find(p => p.nombre === combo.platillo);
    if (!platillo) continue;
    for (const ing of combo.ingredientes) {
      const ingrediente = ingredientes.find(i => i.name === ing.name);
      if (!ingrediente) continue;
      await piRepo.save({
        platillo,
        ingrediente,
        cantidad: ing.cantidad,
        unidad: 'g',
      });
    }
  }
};
