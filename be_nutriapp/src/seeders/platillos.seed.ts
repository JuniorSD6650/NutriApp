import { DataSource } from 'typeorm';
import { Platillo } from '../platillos/entities/platillo.entity';

export const platillosSeed = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(Platillo);
  if (await repo.count()) return;
  await repo.save([
    { nombre: 'Ensalada César', descripcion: 'Lechuga, pollo, aderezo césar, crutones', calorias: 350 },
    { nombre: 'Tacos de Pollo', descripcion: 'Tortilla, pollo, salsa, cebolla, cilantro', calorias: 420 },
    { nombre: 'Avena con Fruta', descripcion: 'Avena, leche, plátano, manzana', calorias: 280 },
  ]);
};
