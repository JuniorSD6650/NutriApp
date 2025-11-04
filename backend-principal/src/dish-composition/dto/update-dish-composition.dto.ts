import { PartialType } from '@nestjs/swagger';
import { CreateDishCompositionDto } from './create-dish-composition.dto';

export class UpdateDishCompositionDto extends PartialType(CreateDishCompositionDto) {}
