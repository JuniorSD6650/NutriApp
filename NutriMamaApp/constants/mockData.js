// --- Datos Estáticos (Simulación de Base de Datos) ---

export const MOCK_USER = {
  name: 'Maria',
  childName: 'Luis',
  profilePic: require('../assets/images/profile/maria-profile.jpg'),
};

export const MOCK_HISTORY = [
  {
    id: 1,
    date: 'Ayer, Almuerzo',
    title: 'Lentejitas con Pollo',
    iron: 5.8,
    calories: 320,
    image: require('../assets/images/meals/lentejas-pollo.jpg'),
  },
  {
    id: 2,
    date: 'Ayer, Desayuno',
    title: 'Hígado Frito con Yuca',
    iron: 8.1,
    calories: 410,
    image: require('../assets/images/meals/higado-yuca.jpg'),
  },
  {
    id: 3,
    date: 'Hace 2 días, Almuerzo',
    title: 'Sangrecita con Arroz',
    iron: 9.5,
    calories: 380,
    image: require('../assets/images/meals/sangrecita-arroz.jpg'),
  },
];