import { PartialType } from '@nestjs/mapped-types';
import { CreateMedicoProfileDto } from './create-medico-profile.dto';

export class UpdateMedicoProfileDto extends PartialType(CreateMedicoProfileDto) {}
