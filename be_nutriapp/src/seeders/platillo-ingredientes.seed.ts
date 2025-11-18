import { DataSource } from 'typeorm';
import { PlatilloIngrediente } from '../platillos/entities/platillo-ingrediente.entity';
import { Platillo } from '../platillos/entities/platillo.entity';
import { Ingrediente } from '../ingredientes/entities/ingrediente.entity';

export const platilloIngredientesSeed = async (dataSource: DataSource) => {
  const platilloIngredienteRepo = dataSource.getRepository(PlatilloIngrediente);
  const platilloRepo = dataSource.getRepository(Platillo);
  const ingredienteRepo = dataSource.getRepository(Ingrediente);

  const count = await platilloIngredienteRepo.count();
  if (count > 0) {
    console.log(`⚠️ Ya existen ${count} relaciones platillo-ingrediente. Omitiendo.`);
    return;
  }

  console.log('🔗 Creando recetas con ingredientes ricos en hierro...');

  // CORRECCIÓN: Cambiar 'nombre' por 'name' para Ingrediente
  const findPlatillo = async (nombre: string) => 
    await platilloRepo.findOne({ where: { nombre } });
  
  const findIngrediente = async (name: string) => 
    await ingredienteRepo.findOne({ where: { name } });

  // RECETA 1: Lentejas guisadas con arroz (8.1 mg hierro/porción)
  const lentejas = await findPlatillo('Lentejas guisadas con arroz');
  if (lentejas) {
    const lentejasIng = await findIngrediente('Lentejas');
    const arrozIng = await findIngrediente('Arroz integral');
    const tomateIng = await findIngrediente('Tomate');
    const cebollaIng = await findIngrediente('Cebolla');

    if (lentejasIng && arrozIng && tomateIng && cebollaIng) {
      await platilloIngredienteRepo.save([
        { platillo: lentejas, ingrediente: lentejasIng, cantidad: 150, unidad: 'g' },
        { platillo: lentejas, ingrediente: arrozIng, cantidad: 100, unidad: 'g' },
        { platillo: lentejas, ingrediente: tomateIng, cantidad: 50, unidad: 'g' },
        { platillo: lentejas, ingrediente: cebollaIng, cantidad: 30, unidad: 'g' },
      ] as any);
    }
  }

  // RECETA 2: Hígado encebollado (17.6 mg hierro)
  const higado = await findPlatillo('Hígado encebollado');
  if (higado) {
    const higadoIng = await findIngrediente('Hígado de res');
    const cebollaIng = await findIngrediente('Cebolla');

    if (higadoIng && cebollaIng) {
      await platilloIngredienteRepo.save([
        { platillo: higado, ingrediente: higadoIng, cantidad: 200, unidad: 'g' },
        { platillo: higado, ingrediente: cebollaIng, cantidad: 80, unidad: 'g' },
      ] as any);
    }
  }

  // RECETA 3: Ensalada de espinacas con quinoa
  const ensaladaEspinaca = await findPlatillo('Ensalada de espinacas con quinoa');
  if (ensaladaEspinaca) {
    const espinacaIng = await findIngrediente('Espinaca');
    const quinoaIng = await findIngrediente('Quinoa');
    const tomateIng = await findIngrediente('Tomate');
    const aguacateIng = await findIngrediente('Aguacate');

    if (espinacaIng && quinoaIng && tomateIng && aguacateIng) {
      await platilloIngredienteRepo.save([
        { platillo: ensaladaEspinaca, ingrediente: espinacaIng, cantidad: 100, unidad: 'g' },
        { platillo: ensaladaEspinaca, ingrediente: quinoaIng, cantidad: 80, unidad: 'g' },
        { platillo: ensaladaEspinaca, ingrediente: tomateIng, cantidad: 60, unidad: 'g' },
        { platillo: ensaladaEspinaca, ingrediente: aguacateIng, cantidad: 50, unidad: 'g' },
      ] as any);
    }
  }

  // RECETA 4: Tacos de carne con frijoles
  const tacos = await findPlatillo('Tacos de carne con frijoles');
  if (tacos) {
    const carneIng = await findIngrediente('Carne de res magra');
    const frijolesIng = await findIngrediente('Frijoles negros');
    const aguacateIng = await findIngrediente('Aguacate');

    if (carneIng && frijolesIng && aguacateIng) {
      await platilloIngredienteRepo.save([
        { platillo: tacos, ingrediente: carneIng, cantidad: 150, unidad: 'g' },
        { platillo: tacos, ingrediente: frijolesIng, cantidad: 100, unidad: 'g' },
        { platillo: tacos, ingrediente: aguacateIng, cantidad: 40, unidad: 'g' },
      ] as any);
    }
  }

  // RECETA 5: Bowl de tofu con vegetales
  const bowlTofu = await findPlatillo('Bowl de tofu con vegetales');
  if (bowlTofu) {
    const tofuIng = await findIngrediente('Tofu');
    const brocoliIng = await findIngrediente('Brócoli');
    const espinacaIng = await findIngrediente('Espinaca');
    const quinoaIng = await findIngrediente('Quinoa');

    if (tofuIng && brocoliIng && espinacaIng && quinoaIng) {
      await platilloIngredienteRepo.save([
        { platillo: bowlTofu, ingrediente: tofuIng, cantidad: 150, unidad: 'g' },
        { platillo: bowlTofu, ingrediente: brocoliIng, cantidad: 100, unidad: 'g' },
        { platillo: bowlTofu, ingrediente: espinacaIng, cantidad: 80, unidad: 'g' },
        { platillo: bowlTofu, ingrediente: quinoaIng, cantidad: 60, unidad: 'g' },
      ] as any);
    }
  }

  // RECETA 6: Garbanzos al curry con arroz
  const garbanzos = await findPlatillo('Garbanzos al curry con arroz');
  if (garbanzos) {
    const garbanzosIng = await findIngrediente('Garbanzos');
    const arrozIng = await findIngrediente('Arroz integral');

    if (garbanzosIng && arrozIng) {
      await platilloIngredienteRepo.save([
        { platillo: garbanzos, ingrediente: garbanzosIng, cantidad: 150, unidad: 'g' },
        { platillo: garbanzos, ingrediente: arrozIng, cantidad: 100, unidad: 'g' },
      ] as any);
    }
  }

  // RECETA 7: Avena con almendras y fresas
  const avena = await findPlatillo('Avena con almendras y fresas');
  if (avena) {
    const avenaIng = await findIngrediente('Avena fortificada');
    const almendrasIng = await findIngrediente('Almendras');
    const fresaIng = await findIngrediente('Fresa');
    const naranjaIng = await findIngrediente('Naranja');

    if (avenaIng && almendrasIng && fresaIng && naranjaIng) {
      await platilloIngredienteRepo.save([
        { platillo: avena, ingrediente: avenaIng, cantidad: 80, unidad: 'g' },
        { platillo: avena, ingrediente: almendrasIng, cantidad: 30, unidad: 'g' },
        { platillo: avena, ingrediente: fresaIng, cantidad: 60, unidad: 'g' },
        { platillo: avena, ingrediente: naranjaIng, cantidad: 50, unidad: 'g' },
      ] as any);
    }
  }

  // RECETA 8: Pollo con brócoli y arroz
  const pollo = await findPlatillo('Pollo con brócoli y arroz');
  if (pollo) {
    const polloIng = await findIngrediente('Pollo');
    const brocoliIng = await findIngrediente('Brócoli');
    const arrozIng = await findIngrediente('Arroz integral');

    if (polloIng && brocoliIng && arrozIng) {
      await platilloIngredienteRepo.save([
        { platillo: pollo, ingrediente: polloIng, cantidad: 150, unidad: 'g' },
        { platillo: pollo, ingrediente: brocoliIng, cantidad: 100, unidad: 'g' },
        { platillo: pollo, ingrediente: arrozIng, cantidad: 80, unidad: 'g' },
      ] as any);
    }
  }

  // RECETA 9: Ensalada de atún con huevo
  const ensaladaAtun = await findPlatillo('Ensalada de atún con huevo');
  if (ensaladaAtun) {
    const atunIng = await findIngrediente('Pescado (atún)');
    const huevoIng = await findIngrediente('Huevo');
    const espinacaIng = await findIngrediente('Espinaca');
    const tomateIng = await findIngrediente('Tomate');

    if (atunIng && huevoIng && espinacaIng && tomateIng) {
      await platilloIngredienteRepo.save([
        { platillo: ensaladaAtun, ingrediente: atunIng, cantidad: 150, unidad: 'g' },
        { platillo: ensaladaAtun, ingrediente: huevoIng, cantidad: 100, unidad: 'g' },
        { platillo: ensaladaAtun, ingrediente: espinacaIng, cantidad: 80, unidad: 'g' },
        { platillo: ensaladaAtun, ingrediente: tomateIng, cantidad: 60, unidad: 'g' },
      ] as any);
    }
  }

  // RECETA 10: Wrap de frijoles y aguacate
  const wrap = await findPlatillo('Wrap de frijoles y aguacate');
  if (wrap) {
    const panIng = await findIngrediente('Pan integral');
    const frijolesIng = await findIngrediente('Frijoles negros');
    const aguacateIng = await findIngrediente('Aguacate');
    const quesoIng = await findIngrediente('Queso fresco');

    if (panIng && frijolesIng && aguacateIng && quesoIng) {
      await platilloIngredienteRepo.save([
        { platillo: wrap, ingrediente: panIng, cantidad: 60, unidad: 'g' },
        { platillo: wrap, ingrediente: frijolesIng, cantidad: 100, unidad: 'g' },
        { platillo: wrap, ingrediente: aguacateIng, cantidad: 50, unidad: 'g' },
        { platillo: wrap, ingrediente: quesoIng, cantidad: 30, unidad: 'g' },
      ] as any);
    }
  }

  console.log('✅ Relaciones platillo-ingrediente creadas con valores nutricionales reales.');
};
