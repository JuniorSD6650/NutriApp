import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../auth/entities/user.entity';
import { Nino } from '../ninos/entities/nino.entity';
import { RegistroComida } from '../registros/entities/registro-comida.entity';
import { RegistroDeteccionTemprana } from '../registros/entities/registro-deteccion-temprana.entity';
import { Ingredient } from '../ingredient/entities/ingredient.entity';
import { Dish } from '../dish/entities/dish.entity';
import { DishComposition } from '../dish-composition/entities/dish-composition.entity';
import { AgeRange } from '../age-range/entities/age-range.entity';
import { DailyRequirement } from '../daily-requirement/entities/daily-requirement.entity';
import { PlateType } from '../plate-type/entities/plate-type.entity';
import { MealLog } from '../meal-log/entities/meal-log.entity';

@Injectable()
export class SeedersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Nino)
    private readonly ninoRepository: Repository<Nino>,
    @InjectRepository(RegistroComida)
    private readonly comidaRepository: Repository<RegistroComida>,
    @InjectRepository(RegistroDeteccionTemprana)
    private readonly deteccionTempranaRepository: Repository<RegistroDeteccionTemprana>,
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
    @InjectRepository(Dish)
    private readonly dishRepository: Repository<Dish>,
    @InjectRepository(DishComposition)
    private readonly dishCompositionRepository: Repository<DishComposition>,
    @InjectRepository(AgeRange)
    private readonly ageRangeRepository: Repository<AgeRange>,
    @InjectRepository(DailyRequirement)
    private readonly dailyRequirementRepository: Repository<DailyRequirement>,
    @InjectRepository(PlateType)
    private readonly plateTypeRepository: Repository<PlateType>,
    @InjectRepository(MealLog)
    private readonly mealLogRepository: Repository<MealLog>,
  ) {}

  async seedAll() {
    console.log('🌱 Iniciando seeding...');
    
    // Limpiar datos existentes
    await this.clearData();
    
    // Crear datos base para nutrición
    const ageRanges = await this.seedAgeRanges();
    await this.seedDailyRequirements(ageRanges);
    await this.seedPlateTypes(ageRanges);
    
    // Crear ingredientes y platillos
    await this.seedIngredients();
    const dishes = await this.seedDishes();
    await this.seedDishCompositions(dishes);
    
    // Crear usuarios y niños
    const users = await this.seedUsers();
    const ninos = await this.seedNinos(users);
    
    // Crear registros existentes
    await this.seedRegistrosComida(ninos);
    await this.seedRegistrosDeteccionTemprana(ninos);
    
    // Crear meal logs con la nueva lógica
    await this.seedMealLogs(ninos, dishes);
    
    console.log('✅ Seeding completado exitosamente!');
  }

  private async clearData() {
    console.log('🧹 Limpiando datos existentes...');
    
    try {
      await this.mealLogRepository.clear();
      await this.dishCompositionRepository.clear();
      await this.dishRepository.clear();
      await this.ingredientRepository.clear();
      await this.plateTypeRepository.clear();
      await this.dailyRequirementRepository.clear();
      await this.ageRangeRepository.clear();
      await this.deteccionTempranaRepository.clear();
      await this.comidaRepository.clear();
      await this.ninoRepository.clear();
      await this.userRepository.clear();
      console.log('✓ Datos limpiados exitosamente');
    } catch (error) {
      console.log('ℹ️ No hay datos para limpiar o las tablas no existen aún');
    }
  }

  private async seedAgeRanges(): Promise<AgeRange[]> {
    console.log('📅 Creando rangos de edad...');
    
    const ageRangesData = [
      { description: "7-12 meses", min_months: 7, max_months: 12 },
      { description: "1-3 años", min_months: 13, max_months: 36 },
      { description: "4-8 años", min_months: 37, max_months: 96 }
    ];

    const savedRanges: AgeRange[] = [];
    for (const rangeData of ageRangesData) {
      const range = this.ageRangeRepository.create(rangeData);
      const savedRange = await this.ageRangeRepository.save(range);
      savedRanges.push(savedRange);
      console.log(`✓ Rango de edad creado: ${savedRange.description}`);
    }

    return savedRanges;
  }

  private async seedDailyRequirements(ageRanges: AgeRange[]): Promise<void> {
    console.log('💊 Creando requerimientos diarios...');
    
    const requirements = [
      { age_range_description: "7-12 meses", nutrient: "hierro", min_value_mg: 11, max_value_mg: 40 },
      { age_range_description: "1-3 años", nutrient: "hierro", min_value_mg: 7, max_value_mg: 40 },
      { age_range_description: "4-8 años", nutrient: "hierro", min_value_mg: 10, max_value_mg: 40 }
    ];

    for (const reqData of requirements) {
      const ageRange = ageRanges.find(ar => ar.description === reqData.age_range_description);
      if (ageRange) {
        const requirement = this.dailyRequirementRepository.create({
          nutrient: reqData.nutrient,
          min_value_mg: reqData.min_value_mg,
          max_value_mg: reqData.max_value_mg,
          ageRange,
        });
        await this.dailyRequirementRepository.save(requirement);
        console.log(`✓ Requerimiento creado: ${reqData.nutrient} para ${reqData.age_range_description}`);
      }
    }
  }

  private async seedPlateTypes(ageRanges: AgeRange[]): Promise<void> {
    console.log('🍽️ Creando tipos de plato...');
    
    const plateTypes = [
      { age_range_description: "7-12 meses", description: "Plato pequeño (bebé)", serving_size_g: 120 },
      { age_range_description: "1-3 años", description: "Plato mediano (niño)", serving_size_g: 180 },
      { age_range_description: "4-8 años", description: "Plato estándar", serving_size_g: 250 }
    ];

    for (const plateData of plateTypes) {
      const ageRange = ageRanges.find(ar => ar.description === plateData.age_range_description);
      if (ageRange) {
        const plate = this.plateTypeRepository.create({
          description: plateData.description,
          serving_size_g: plateData.serving_size_g,
          ageRange,
        });
        await this.plateTypeRepository.save(plate);
        console.log(`✓ Tipo de plato creado: ${plateData.description}`);
      }
    }
  }

  private async seedIngredients(): Promise<void> {
    console.log('🥘 Creando ingredientes...');
    
    const ingredients = [
      { name: "Sangresita de pollo (cocida)", iron_mg_per_100g: 29.4, calories_per_100g: 140 },
      { name: "Arroz blanco (cocido)", iron_mg_per_100g: 0.2, calories_per_100g: 130 },
      { name: "Cebolla (salteada)", iron_mg_per_100g: 0.3, calories_per_100g: 60 },
      { name: "Pimiento rojo (salteado)", iron_mg_per_100g: 0.5, calories_per_100g: 35 },
      { name: "Lentejas (cocidas)", iron_mg_per_100g: 3.3, calories_per_100g: 116 },
      { name: "Carne de res (molida, cocida)", iron_mg_per_100g: 2.7, calories_per_100g: 250 },
      { name: "Espinaca (cocida)", iron_mg_per_100g: 3.6, calories_per_100g: 23 },
      { name: "Huevo (cocido)", iron_mg_per_100g: 1.2, calories_per_100g: 155 }
    ];

    for (const ingredientData of ingredients) {
      const ingredient = this.ingredientRepository.create(ingredientData);
      await this.ingredientRepository.save(ingredient);
      console.log(`✓ Ingrediente creado: ${ingredient.name}`);
    }
  }

  private async seedDishes(): Promise<Dish[]> {
    console.log('🍽️ Creando platillos...');
    
    const dishesData = [
      { name: "Guiso de Sangresita", description: "Platillo nutritivo con sangresita, arroz y verduras" },
      { name: "Lentejas con Carne", description: "Lentejas cocidas con carne de res y arroz" }
    ];

    const savedDishes: Dish[] = [];
    for (const dishData of dishesData) {
      const dish = this.dishRepository.create(dishData);
      const savedDish = await this.dishRepository.save(dish);
      savedDishes.push(savedDish);
      console.log(`✓ Platillo creado: ${savedDish.name}`);
    }

    return savedDishes;
  }

  private async seedDishCompositions(dishes: Dish[]): Promise<void> {
    console.log('📝 Creando composiciones de platillos...');
    
    const compositions = [
      // Guiso de Sangresita
      { dishName: "Guiso de Sangresita", ingredientName: "Sangresita de pollo (cocida)", grams: 100 },
      { dishName: "Guiso de Sangresita", ingredientName: "Arroz blanco (cocido)", grams: 50 },
      { dishName: "Guiso de Sangresita", ingredientName: "Cebolla (salteada)", grams: 30 },
      
      // Lentejas con Carne
      { dishName: "Lentejas con Carne", ingredientName: "Lentejas (cocidas)", grams: 100 },
      { dishName: "Lentejas con Carne", ingredientName: "Carne de res (molida, cocida)", grams: 50 },
      { dishName: "Lentejas con Carne", ingredientName: "Arroz blanco (cocido)", grams: 50 }
    ];

    for (const compData of compositions) {
      const dish = dishes.find(d => d.name === compData.dishName);
      const ingredient = await this.ingredientRepository.findOne({ where: { name: compData.ingredientName } });
      
      if (dish && ingredient) {
        const composition = this.dishCompositionRepository.create({
          dish,
          ingredient,
          grams: compData.grams,
        });
        await this.dishCompositionRepository.save(composition);
        console.log(`✓ Composición creada: ${compData.ingredientName} en ${compData.dishName}`);
      }
    }
  }

  private async seedMealLogs(ninos: Nino[], dishes: Dish[]): Promise<void> {
    console.log('📋 Creando registros de comidas (meal logs)...');
    
    for (let ninoIndex = 0; ninoIndex < ninos.length; ninoIndex++) {
      const nino = ninos[ninoIndex];
      const ageInMonths = nino.getAgeInMonths();
      
      // Determinar el rango de edad y tipo de plato
      const ageRange = await this.ageRangeRepository
        .createQueryBuilder('ageRange')
        .where(':age BETWEEN ageRange.min_months AND ageRange.max_months', { age: ageInMonths })
        .getOne();
      
      if (!ageRange) continue;
      
      const plateType = await this.plateTypeRepository.findOne({ 
        where: { ageRange: { id: ageRange.id } },
        relations: ['ageRange']
      });
      
      if (!plateType) continue;

      // Crear 5 meal logs por niño en las últimas 2 semanas
      for (let i = 0; i < 5; i++) {
        const randomDish = dishes[Math.floor(Math.random() * dishes.length)];
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - (i * 3)); // Cada 3 días
        
        // Obtener las composiciones del platillo
        const compositions = await this.dishCompositionRepository.find({
          where: { dish: { id: randomDish.id } },
          relations: ['ingredient'],
        });
        
        // Calcular el hierro total de la receta base
        let totalBaseGrams = 0;
        let totalBaseIron = 0;
        
        for (const comp of compositions) {
          totalBaseGrams += comp.grams;
          const ironInComponent = (comp.ingredient.iron_mg_per_100g / 100) * comp.grams;
          totalBaseIron += ironInComponent;
        }
        
        // Calcular el factor de escalado
        const scalingFactor = plateType.serving_size_g / totalBaseGrams;
        const finalIronConsumed = totalBaseIron * scalingFactor;
        
        const mealLog = this.mealLogRepository.create({
          date: fecha,
          grams_served: plateType.serving_size_g,
          iron_consumed_mg: Number(finalIronConsumed.toFixed(2)),
          calories_consumed: 0, // Se puede calcular igual que el hierro si es necesario
          patient: nino,
          dish: randomDish,
        });
        
        await this.mealLogRepository.save(mealLog);
      }
      console.log(`✓ Meal logs creados para: ${nino.nombre}`);
    }
  }

  private async seedUsers(): Promise<User[]> {
    console.log('👤 Creando usuarios...');
    
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const users = [
      // Madres
      { nombre: 'María González', email: 'maria@gmail.com', password_hash: hashedPassword, rol: 'madre' },
      { nombre: 'Ana López', email: 'ana@gmail.com', password_hash: hashedPassword, rol: 'madre' },
      { nombre: 'Carmen Rodríguez', email: 'carmen@gmail.com', password_hash: hashedPassword, rol: 'madre' },
      { nombre: 'Isabel Martínez', email: 'isabel@gmail.com', password_hash: hashedPassword, rol: 'madre' },
      { nombre: 'Laura Sánchez', email: 'laura@gmail.com', password_hash: hashedPassword, rol: 'madre' },
      { nombre: 'Patricia Jiménez', email: 'patricia@gmail.com', password_hash: hashedPassword, rol: 'madre' },
      { nombre: 'Rosa García', email: 'rosa@gmail.com', password_hash: hashedPassword, rol: 'madre' },
      { nombre: 'Mónica Herrera', email: 'monica@gmail.com', password_hash: hashedPassword, rol: 'madre' },
      { nombre: 'Elena Vásquez', email: 'elena@gmail.com', password_hash: hashedPassword, rol: 'madre' },
      { nombre: 'Lucía Torres', email: 'lucia@gmail.com', password_hash: hashedPassword, rol: 'madre' },
      { nombre: 'Cristina Morales', email: 'cristina@gmail.com', password_hash: hashedPassword, rol: 'madre' },
      { nombre: 'Andrea Ruiz', email: 'andrea@gmail.com', password_hash: hashedPassword, rol: 'madre' },
      // Admins
      { nombre: 'Dr. Admin Principal', email: 'admin@nutrimama.com', password_hash: hashedPassword, rol: 'admin' },
      { nombre: 'Dra. Nutricionista', email: 'nutricionista@nutrimama.com', password_hash: hashedPassword, rol: 'admin' },
    ];

    const savedUsers: User[] = [];
    for (const userData of users) {
      const user = this.userRepository.create(userData);
      const savedUser = await this.userRepository.save(user);
      savedUsers.push(savedUser);
      console.log(`✓ Usuario creado: ${savedUser.email}`);
    }

    return savedUsers;
  }

  private async seedNinos(users: User[]): Promise<Nino[]> {
    console.log('👶 Creando niños...');
    
    const madres = users.filter(user => user.rol === 'madre');
    
    const ninosData = [
      // Niños con diferentes niveles de anemia para mostrar progreso
      { nombre: 'Sofía González', fecha_nacimiento: new Date('2022-03-15'), birthYear: 2022, genero: 'femenino', peso_actual: 12.5, altura_actual: 82.0, madre: madres[0] },
      { nombre: 'Diego González', fecha_nacimiento: new Date('2021-08-22'), birthYear: 2021, genero: 'masculino', peso_actual: 15.2, altura_actual: 90.5, madre: madres[0] },
      { nombre: 'Valentina López', fecha_nacimiento: new Date('2022-12-10'), birthYear: 2022, genero: 'femenino', peso_actual: 10.8, altura_actual: 75.0, madre: madres[1] },
      { nombre: 'Mateo Rodríguez', fecha_nacimiento: new Date('2023-01-25'), birthYear: 2023, genero: 'masculino', peso_actual: 9.5, altura_actual: 70.0, madre: madres[2] },
      { nombre: 'Emma Martínez', fecha_nacimiento: new Date('2022-07-08'), birthYear: 2022, genero: 'femenino', peso_actual: 11.8, altura_actual: 78.5, madre: madres[3] },
      { nombre: 'Lucas Sánchez', fecha_nacimiento: new Date('2021-11-30'), birthYear: 2021, genero: 'masculino', peso_actual: 14.3, altura_actual: 88.0, madre: madres[4] },
      { nombre: 'Mía Jiménez', fecha_nacimiento: new Date('2023-04-12'), birthYear: 2023, genero: 'femenino', peso_actual: 8.9, altura_actual: 68.0, madre: madres[5] },
      { nombre: 'Santiago García', fecha_nacimiento: new Date('2022-09-18'), birthYear: 2022, genero: 'masculino', peso_actual: 13.1, altura_actual: 84.5, madre: madres[6] },
      { nombre: 'Isabella Herrera', fecha_nacimiento: new Date('2021-06-05'), birthYear: 2021, genero: 'femenino', peso_actual: 16.0, altura_actual: 92.0, madre: madres[7] },
      { nombre: 'Sebastián Vásquez', fecha_nacimiento: new Date('2023-02-28'), birthYear: 2023, genero: 'masculino', peso_actual: 9.2, altura_actual: 71.5, madre: madres[8] },
      { nombre: 'Camila Torres', fecha_nacimiento: new Date('2022-05-14'), birthYear: 2022, genero: 'femenino', peso_actual: 12.0, altura_actual: 80.0, madre: madres[9] },
      { nombre: 'Alejandro Morales', fecha_nacimiento: new Date('2021-10-20'), birthYear: 2021, genero: 'masculino', peso_actual: 15.8, altura_actual: 91.0, madre: madres[10] },
      { nombre: 'Valeria Ruiz', fecha_nacimiento: new Date('2023-03-07'), birthYear: 2023, genero: 'femenino', peso_actual: 8.7, altura_actual: 69.5, madre: madres[11] },
    ];

    const savedNinos: Nino[] = [];
    for (const ninoData of ninosData) {
      const nino = this.ninoRepository.create(ninoData);
      const savedNino = await this.ninoRepository.save(nino);
      savedNinos.push(savedNino);
      console.log(`✓ Niño creado: ${savedNino.nombre}`);
    }

    return savedNinos;
  }

  private async seedRegistrosComida(ninos: Nino[]) {
    console.log('🍎 Creando registros de comida...');
    
    const comidas = [
      { hierro: 8.5, calorias: 450, proteinas: 25, carbohidratos: 55, grasas: 15 },
      { hierro: 6.2, calorias: 380, proteinas: 20, carbohidratos: 48, grasas: 12 },
      { hierro: 7.8, calorias: 420, proteinas: 22, carbohidratos: 52, grasas: 14 },
      { hierro: 5.5, calorias: 320, proteinas: 18, carbohidratos: 42, grasas: 10 },
      { hierro: 9.2, calorias: 480, proteinas: 28, carbohidratos: 58, grasas: 16 },
      { hierro: 4.8, calorias: 290, proteinas: 15, carbohidratos: 38, grasas: 8 },
      { hierro: 7.0, calorias: 400, proteinas: 24, carbohidratos: 50, grasas: 13 },
      { hierro: 8.8, calorias: 460, proteinas: 26, carbohidratos: 56, grasas: 15 },
    ];

    // Crear múltiples registros por niño a lo largo de varios meses
    for (let ninoIndex = 0; ninoIndex < ninos.length; ninoIndex++) {
      const nino = ninos[ninoIndex];
      
      // Crear registros para los últimos 3 meses
      for (let mes = 0; mes < 3; mes++) {
        for (let dia = 0; dia < 8; dia++) {
          const fecha = new Date();
          fecha.setMonth(fecha.getMonth() - mes);
          fecha.setDate(fecha.getDate() - (dia * 4)); // Cada 4 días
          
          const comidaIndex = (ninoIndex + mes + dia) % comidas.length;
          const comida = comidas[comidaIndex];
          
          const registro = this.comidaRepository.create({
            url_foto: `https://example.com/photos/meal_${ninoIndex}_${mes}_${dia}.jpg`,
            fecha,
            hierro_mg: comida.hierro + (Math.random() * 2 - 1), // Variación aleatoria
            calorias: comida.calorias + Math.floor(Math.random() * 100 - 50),
            json_nutrientes: {
              proteinas: comida.proteinas,
              carbohidratos: comida.carbohidratos,
              grasas: comida.grasas,
              fibra: 5 + Math.floor(Math.random() * 5),
              vitamina_c: 30 + Math.floor(Math.random() * 20),
              calcio: 80 + Math.floor(Math.random() * 50),
            },
            nino,
          });
          
          await this.comidaRepository.save(registro);
        }
      }
      console.log(`✓ Registros de comida creados para: ${nino.nombre}`);
    }
  }

  private async seedRegistrosDeteccionTemprana(ninos: Nino[]) {
    console.log('👁️ Creando registros de detección temprana...');
    
    // Simular detecciones with diferentes niveles de alerta
    for (let ninoIndex = 0; ninoIndex < ninos.length; ninoIndex++) {
      const nino = ninos[ninoIndex];
      
      // Crear registros semanales para los últimos 3 meses
      for (let semana = 0; semana < 12; semana++) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - (semana * 7));
        
        // Simular diferentes resultados basados en el progreso del niño
        const probabilidadAnemia = Math.max(0, 0.7 - (semana * 0.05)); // Mejora con el tiempo
        const random = Math.random();
        
        let resultado_ia = 'normal';
        let nivel_alerta = 'baja';
        let confianza_ia = 85 + Math.random() * 10; // Entre 85-95%
        
        if (random < probabilidadAnemia * 0.3) {
          resultado_ia = 'probable_anemia';
          nivel_alerta = 'alta';
          confianza_ia = 90 + Math.random() * 10;
        } else if (random < probabilidadAnemia * 0.6) {
          resultado_ia = 'sospechoso';
          nivel_alerta = 'media';
          confianza_ia = 80 + Math.random() * 15;
        }
        
        const registro = this.deteccionTempranaRepository.create({
          url_foto: `https://example.com/photos/eye_detection_${ninoIndex}_${semana}.jpg`,
          fecha,
          confianza_ia: Math.round(confianza_ia * 10) / 10,
          resultado_ia,
          nivel_alerta,
          parametros_detectados: {
            color_mucosa: resultado_ia === 'normal' ? 'rosado' : resultado_ia === 'sospechoso' ? 'palido' : 'muy_palido',
            saturacion_color: Math.random() * 100,
            textura: 'normal',
            vascularizacion: resultado_ia === 'normal' ? 'adecuada' : 'reducida',
            indice_palidez: resultado_ia === 'normal' ? Math.random() * 30 : 30 + Math.random() * 70,
          },
          observaciones: resultado_ia === 'normal' ? 'Mucosa ocular con coloración normal' : 
                        resultado_ia === 'sospechoso' ? 'Se detecta ligera palidez en mucosa ocular' :
                        'Palidez marcada en mucosa ocular, se recomienda evaluación médica',
          nino,
        });
        
        await this.deteccionTempranaRepository.save(registro);
      }
      console.log(`✓ Registros de detección temprana creados para: ${nino.nombre}`);
    }
  }
}
