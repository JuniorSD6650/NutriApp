// src/seeders/nutrientes.seed.ts
import { Unit } from '../ingredientes/enums/unit.enum';

export const nutrientesSeed = [
  { name: 'Hierro', unit: Unit.MG },
  { name: 'Proteínas', unit: Unit.G },
  { name: 'Carbohidratos', unit: Unit.G },
  { name: 'Calorías', unit: Unit.KCAL },
  { name: 'Vitamina C', unit: Unit.MG }, // Ayuda a absorber hierro
];
