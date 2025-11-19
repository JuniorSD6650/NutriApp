import { DataSource } from 'typeorm';
import { Platillo } from '../platillos/entities/platillo.entity';
import { Ingrediente } from '../ingredientes/entities/ingrediente.entity';
import { PlatilloIngrediente } from '../platillos/entities/platillo-ingrediente.entity';

export const platilloIngredientesSeed = async (dataSource: DataSource) => {
  const platilloRepo = dataSource.getRepository(Platillo);
  const ingredienteRepo = dataSource.getRepository(Ingrediente);
  const platilloIngredienteRepo = dataSource.getRepository(PlatilloIngrediente);

  const relaciones = [
    // Lentejas guisadas con arroz
    { platillo: 'Lentejas guisadas con arroz', ingrediente: 'Lentejas', cantidad: 150, unidad: 'g' },
    { platillo: 'Lentejas guisadas con arroz', ingrediente: 'Arroz integral', cantidad: 100, unidad: 'g' },
    { platillo: 'Lentejas guisadas con arroz', ingrediente: 'Tomate', cantidad: 50, unidad: 'g' },
    { platillo: 'Lentejas guisadas con arroz', ingrediente: 'Cebolla', cantidad: 30, unidad: 'g' },

    // Hígado encebollado
    { platillo: 'Hígado encebollado', ingrediente: 'Hígado de res', cantidad: 200, unidad: 'g' },
    { platillo: 'Hígado encebollado', ingrediente: 'Cebolla', cantidad: 80, unidad: 'g' },

    // Ensalada de espinacas con quinoa
    { platillo: 'Ensalada de espinacas con quinoa', ingrediente: 'Espinaca', cantidad: 100, unidad: 'g' },
    { platillo: 'Ensalada de espinacas con quinoa', ingrediente: 'Quinoa', cantidad: 80, unidad: 'g' },
    { platillo: 'Ensalada de espinacas con quinoa', ingrediente: 'Tomate', cantidad: 60, unidad: 'g' },
    { platillo: 'Ensalada de espinacas con quinoa', ingrediente: 'Aguacate', cantidad: 50, unidad: 'g' },

    // Tacos de carne con frijoles
    { platillo: 'Tacos de carne con frijoles', ingrediente: 'Carne de res magra', cantidad: 120, unidad: 'g' },
    { platillo: 'Tacos de carne con frijoles', ingrediente: 'Frijoles negros', cantidad: 100, unidad: 'g' },
    { platillo: 'Tacos de carne con frijoles', ingrediente: 'Aguacate', cantidad: 40, unidad: 'g' },

    // Bowl de tofu con vegetales
    { platillo: 'Bowl de tofu con vegetales', ingrediente: 'Tofu', cantidad: 150, unidad: 'g' },
    { platillo: 'Bowl de tofu con vegetales', ingrediente: 'Brócoli', cantidad: 100, unidad: 'g' },
    { platillo: 'Bowl de tofu con vegetales', ingrediente: 'Espinaca', cantidad: 50, unidad: 'g' },
    { platillo: 'Bowl de tofu con vegetales', ingrediente: 'Quinoa', cantidad: 60, unidad: 'g' },

    // Garbanzos al curry con arroz
    { platillo: 'Garbanzos al curry con arroz', ingrediente: 'Garbanzos', cantidad: 150, unidad: 'g' },
    { platillo: 'Garbanzos al curry con arroz', ingrediente: 'Arroz integral', cantidad: 100, unidad: 'g' },

    // Avena con almendras y fresas
    { platillo: 'Avena con almendras y fresas', ingrediente: 'Avena fortificada', cantidad: 60, unidad: 'g' },
    { platillo: 'Avena con almendras y fresas', ingrediente: 'Almendras', cantidad: 30, unidad: 'g' },
    { platillo: 'Avena con almendras y fresas', ingrediente: 'Fresa', cantidad: 80, unidad: 'g' },
    { platillo: 'Avena con almendras y fresas', ingrediente: 'Naranja', cantidad: 50, unidad: 'g' },

    // Pollo con brócoli y arroz
    { platillo: 'Pollo con brócoli y arroz', ingrediente: 'Pollo', cantidad: 150, unidad: 'g' },
    { platillo: 'Pollo con brócoli y arroz', ingrediente: 'Brócoli', cantidad: 100, unidad: 'g' },
    { platillo: 'Pollo con brócoli y arroz', ingrediente: 'Arroz integral', cantidad: 100, unidad: 'g' },

    // Ensalada de atún con huevo
    { platillo: 'Ensalada de atún con huevo', ingrediente: 'Pescado (atún)', cantidad: 120, unidad: 'g' },
    { platillo: 'Ensalada de atún con huevo', ingrediente: 'Huevo', cantidad: 50, unidad: 'g' },
    { platillo: 'Ensalada de atún con huevo', ingrediente: 'Espinaca', cantidad: 80, unidad: 'g' },
    { platillo: 'Ensalada de atún con huevo', ingrediente: 'Tomate', cantidad: 60, unidad: 'g' },

    // Wrap de frijoles y aguacate
    { platillo: 'Wrap de frijoles y aguacate', ingrediente: 'Frijoles negros', cantidad: 120, unidad: 'g' },
    { platillo: 'Wrap de frijoles y aguacate', ingrediente: 'Aguacate', cantidad: 80, unidad: 'g' },
    { platillo: 'Wrap de frijoles y aguacate', ingrediente: 'Tomate', cantidad: 50, unidad: 'g' },
  ];

  for (const rel of relaciones) {
    const platillo = await platilloRepo.findOne({ where: { nombre: rel.platillo } });
    const ingrediente = await ingredienteRepo.findOne({ where: { name: rel.ingrediente } });

    if (platillo && ingrediente) {
      const exists = await platilloIngredienteRepo.findOne({
        where: {
          platillo: { id: platillo.id },
          ingrediente: { id: ingrediente.id },
        },
      });

      if (!exists) {
        await platilloIngredienteRepo.save(
          platilloIngredienteRepo.create({
            platillo,
            ingrediente,
            cantidad: rel.cantidad,
            unidad: rel.unidad,
          })
        );
      }
    }
  }

  console.log('✓ Relaciones platillo-ingrediente creadas.');
};
