// src/seeders/nutrientes.seed.ts
import { Unit } from '../ingredientes/enums/unit.enum';
export const nutrientesSeed = [
  { name: 'Hierro', unit: Unit.MG },
  { name: 'Calorías', unit: Unit.KCAL },
  { name: 'Proteínas', unit: Unit.G },
  { name: 'Carbohidratos', unit: Unit.G },
];
