import { PartialType } from '@nestjs/mapped-types';
import { CreatePacienteProfileDto } from './create-paciente-profile.dto';

export class UpdatePacienteProfileDto extends PartialType(CreatePacienteProfileDto) {}
