import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingredient } from './entities/ingredient.entity';
import { CreateIngredientDto, UpdateIngredientDto } from './dto/ingredient.dto';

@Injectable()
export class IngredientService {
  constructor(
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
  ) {}

  async create(createIngredientDto: CreateIngredientDto): Promise<Ingredient> {
    const ingredient = this.ingredientRepository.create(createIngredientDto);
    return this.ingredientRepository.save(ingredient);
  }

  async findAll(): Promise<Ingredient[]> {
    return this.ingredientRepository.find();
  }

  async findOne(id: string): Promise<Ingredient> {
    const ingredient = await this.ingredientRepository.findOne({ where: { id } });
    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID ${id} not found`);
    }
    return ingredient;
  }

  async findByName(name: string): Promise<Ingredient> {
    const ingredient = await this.ingredientRepository.findOne({ where: { name } });
    if (!ingredient) {
      throw new NotFoundException(`Ingredient with name "${name}" not found`);
    }
    return ingredient;
  }

  async update(id: string, updateIngredientDto: UpdateIngredientDto): Promise<Ingredient> {
    const ingredient = await this.findOne(id);
    Object.assign(ingredient, updateIngredientDto);
    return this.ingredientRepository.save(ingredient);
  }

  async remove(id: string): Promise<void> {
    const ingredient = await this.findOne(id);
    await this.ingredientRepository.remove(ingredient);
  }

  async findAllPaginated(page: number = 1, limit: number = 10, search?: string): Promise<{
    data: Ingredient[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const queryBuilder = this.ingredientRepository
      .createQueryBuilder('ingredient')
      .orderBy('ingredient.name', 'ASC');

    // Aplicar filtro de búsqueda
    if (search && search.trim()) {
      queryBuilder.where('LOWER(ingredient.name) LIKE LOWER(:search)', { search: `%${search.trim()}%` });
    }

    // Contar total de registros
    const total = await queryBuilder.getCount();

    // Aplicar paginación
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Obtener registros paginados
    const data = await queryBuilder.getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
