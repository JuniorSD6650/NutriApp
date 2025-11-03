import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../auth/entities/user.entity';
import { Nino } from '../ninos/entities/nino.entity';
import { RegistroComida } from '../registros/entities/registro-comida.entity';
import { RegistroTamizaje } from '../registros/entities/registro-tamizaje.entity';

@Injectable()
export class SeedersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Nino)
    private readonly ninoRepository: Repository<Nino>,
    @InjectRepository(RegistroComida)
    private readonly comidaRepository: Repository<RegistroComida>,
    @InjectRepository(RegistroTamizaje)
    private readonly tamizajeRepository: Repository<RegistroTamizaje>,
  ) {}

  async seedAll() {
    console.log('🌱 Iniciando seeding...');
    
    // Limpiar datos existentes
    await this.clearData();
    
    // Crear usuarios
    const users = await this.seedUsers();
    
    // Crear niños
    const ninos = await this.seedNinos(users);
    
    // Crear registros de comida
    await this.seedRegistrosComida(ninos);
    
    // Crear registros de tamizaje
    await this.seedRegistrosTamizaje(ninos);
    
    console.log('✅ Seeding completado exitosamente!');
  }

  private async clearData() {
    console.log('🧹 Limpiando datos existentes...');
    
    try {
      // Usar clear() en lugar de delete({}) para eliminar todos los registros
      await this.tamizajeRepository.clear();
      await this.comidaRepository.clear();
      await this.ninoRepository.clear();
      await this.userRepository.clear();
      console.log('✓ Datos limpiados exitosamente');
    } catch (error) {
      console.log('ℹ️ No hay datos para limpiar o las tablas no existen aún');
    }
  }

  private async seedUsers(): Promise<User[]> {
    console.log('👤 Creando usuarios...');
    
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const users = [
      {
        nombre: 'María González',
        email: 'maria@gmail.com',
        password_hash: hashedPassword,
        rol: 'madre',
      },
      {
        nombre: 'Ana López',
        email: 'ana@gmail.com',
        password_hash: hashedPassword,
        rol: 'madre',
      },
      {
        nombre: 'Carmen Rodríguez',
        email: 'carmen@gmail.com',
        password_hash: hashedPassword,
        rol: 'madre',
      },
      {
        nombre: 'Dr. Admin',
        email: 'admin@nutrimama.com',
        password_hash: hashedPassword,
        rol: 'admin',
      },
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
      {
        nombre: 'Sofía González',
        fecha_nacimiento: new Date('2022-03-15'),
        genero: 'femenino',
        peso_actual: 12.5,
        altura_actual: 82.0,
        madre: madres[0],
      },
      {
        nombre: 'Diego González',
        fecha_nacimiento: new Date('2021-08-22'),
        genero: 'masculino',
        peso_actual: 15.2,
        altura_actual: 90.5,
        madre: madres[0],
      },
      {
        nombre: 'Valentina López',
        fecha_nacimiento: new Date('2022-12-10'),
        genero: 'femenino',
        peso_actual: 10.8,
        altura_actual: 75.0,
        madre: madres[1],
      },
      {
        nombre: 'Mateo Rodríguez',
        fecha_nacimiento: new Date('2023-01-25'),
        genero: 'masculino',
        peso_actual: 9.5,
        altura_actual: 70.0,
        madre: madres[2],
      },
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
    
    const registrosData = [
      {
        url_foto: 'https://example.com/photos/meal1.jpg',
        fecha: new Date('2024-10-25'),
        hierro_mg: 8.5,
        calorias: 450,
        json_nutrientes: {
          proteinas: 25,
          carbohidratos: 55,
          grasas: 15,
          fibra: 8,
          vitamina_c: 45,
          calcio: 120,
        },
        nino: ninos[0],
      },
      {
        url_foto: 'https://example.com/photos/meal2.jpg',
        fecha: new Date('2024-10-26'),
        hierro_mg: 6.2,
        calorias: 380,
        json_nutrientes: {
          proteinas: 20,
          carbohidratos: 48,
          grasas: 12,
          fibra: 6,
          vitamina_c: 35,
          calcio: 95,
        },
        nino: ninos[0],
      },
      {
        url_foto: 'https://example.com/photos/meal3.jpg',
        fecha: new Date('2024-10-25'),
        hierro_mg: 7.8,
        calorias: 420,
        json_nutrientes: {
          proteinas: 22,
          carbohidratos: 52,
          grasas: 14,
          fibra: 7,
          vitamina_c: 40,
          calcio: 110,
        },
        nino: ninos[1],
      },
      {
        url_foto: 'https://example.com/photos/meal4.jpg',
        fecha: new Date('2024-10-24'),
        hierro_mg: 5.5,
        calorias: 320,
        json_nutrientes: {
          proteinas: 18,
          carbohidratos: 42,
          grasas: 10,
          fibra: 5,
          vitamina_c: 30,
          calcio: 85,
        },
        nino: ninos[2],
      },
    ];

    for (const registroData of registrosData) {
      const registro = this.comidaRepository.create(registroData);
      await this.comidaRepository.save(registro);
      console.log(`✓ Registro de comida creado para: ${registroData.nino.nombre}`);
    }
  }

  private async seedRegistrosTamizaje(ninos: Nino[]) {
    console.log('🩸 Creando registros de tamizaje...');
    
    const registrosData = [
      {
        url_foto: 'https://example.com/photos/blood1.jpg',
        fecha: new Date('2024-10-20'),
        resultado_hemoglobina: 11.5,
        interpretacion: 'normal',
        nino: ninos[0],
      },
      {
        url_foto: 'https://example.com/photos/blood2.jpg',
        fecha: new Date('2024-10-18'),
        resultado_hemoglobina: 9.8,
        interpretacion: 'leve',
        nino: ninos[1],
      },
      {
        url_foto: 'https://example.com/photos/blood3.jpg',
        fecha: new Date('2024-10-22'),
        resultado_hemoglobina: 10.2,
        interpretacion: 'normal',
        nino: ninos[2],
      },
      {
        url_foto: 'https://example.com/photos/blood4.jpg',
        fecha: new Date('2024-10-19'),
        resultado_hemoglobina: 8.5,
        interpretacion: 'moderada',
        nino: ninos[3],
      },
    ];

    for (const registroData of registrosData) {
      const registro = this.tamizajeRepository.create(registroData);
      await this.tamizajeRepository.save(registro);
      console.log(`✓ Registro de tamizaje creado para: ${registroData.nino.nombre}`);
    }
  }
}
