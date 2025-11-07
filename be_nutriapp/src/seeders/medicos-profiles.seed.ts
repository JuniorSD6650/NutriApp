// src/seeders/medicos-profiles.seed.ts
export const medicosProfilesSeed = [
  ...Array.from({ length: 5 }).map((_, i) => ({
    userEmail: `medico${i+1}@nutriapp.com`,
    specialty: 'Nutriología',
    licenseNumber: `MED${1000+i+1}`,
    yearsExperience: 5 + i,
    phone: `555-12${i+10}`,
    address: `Calle Salud ${i+1}`,
  })),
];
