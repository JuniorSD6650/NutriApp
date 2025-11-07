// src/seeders/pacientes-profiles.seed.ts
export const pacientesProfilesSeed = [
  ...Array.from({ length: 15 }).map((_, i) => ({
    userEmail: `paciente${i+1}@nutriapp.com`,
    birthDate: `199${i%10}-01-01`,
    height: 160 + (i % 10),
    weight: 55 + (i % 15),
    allergies: i % 3 === 0 ? 'Ninguna' : 'Polen',
    medicalHistory: i % 2 === 0 ? 'Sin antecedentes' : 'Asma',
  })),
];
